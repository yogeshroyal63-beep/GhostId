import numpy as np
from fastapi import APIRouter

from app.models.schemas import ImpostorSimResponse, ScoreRequest, ScoreResponse
from app.services.encoder import encoder_service
from app.services.enrollment import enrollment_service
from app.services.scoring import get_tier, should_update_baseline

router = APIRouter(tags=["scoring"])


@router.post("/score", response_model=ScoreResponse)
async def score(req: ScoreRequest):
    encoder_service.warn_if_placeholder_on_score()
    status = enrollment_service.get_status(req.user_id)

    if not status["enrolled"]:
        return ScoreResponse(
            user_id=req.user_id,
            confidence_score=0.0,
            tier="NOT_ENROLLED",
            action="enroll_first",
            enrolled=False,
            session_count=status["session_count"],
            placeholder_mode=encoder_service.placeholder_mode,
        )

    score_val = enrollment_service.score(req.user_id, req.features)
    tier, action = get_tier(score_val)

    if should_update_baseline(score_val):
        enrollment_service.update_baseline(req.user_id, req.features)

    return ScoreResponse(
        user_id=req.user_id,
        confidence_score=round(score_val, 2),
        tier=tier,
        action=action,
        enrolled=True,
        session_count=status["session_count"],
        placeholder_mode=encoder_service.placeholder_mode,
    )


@router.post("/score/simulate-impostor", response_model=ImpostorSimResponse)
async def simulate_impostor(req: ScoreRequest):
    status = enrollment_service.get_status(req.user_id)
    if not status["enrolled"]:
        return ImpostorSimResponse(
            user_id=req.user_id,
            confidence_score=0.0,
            tier="NOT_ENROLLED",
            action="enroll_first",
            simulated=True,
            placeholder_mode=encoder_service.placeholder_mode,
        )

    impostor_features = np.random.uniform(0.05, 2.5, size=41).tolist()
    score_val = enrollment_service.score(req.user_id, impostor_features)
    tier, action = get_tier(score_val)

    return ImpostorSimResponse(
        user_id=req.user_id,
        confidence_score=round(score_val, 2),
        tier=tier,
        action=action,
        simulated=True,
        placeholder_mode=encoder_service.placeholder_mode,
    )
