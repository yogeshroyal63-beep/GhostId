import numpy as np
from fastapi import APIRouter, Depends

from app.core.security import check_rate_limit, verify_api_key
from app.models.schemas import ImpostorSimResponse, ScoreRequest, ScoreResponse
from app.services.encoder import encoder_service
from app.services.enrollment import enrollment_service
from app.services.scoring import get_tier, should_update_baseline

router = APIRouter(tags=["scoring"])


@router.post("/score", response_model=ScoreResponse, dependencies=[Depends(verify_api_key)])
async def score(req: ScoreRequest):
    encoder_service.warn_if_placeholder_on_score()
    check_rate_limit(req.user_id, "score")

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


@router.post(
    "/score/simulate-impostor",
    response_model=ImpostorSimResponse,
    dependencies=[Depends(verify_api_key)],
)
async def simulate_impostor(req: ScoreRequest):
    """
    Simulate an impostor by injecting a realistic random feature vector drawn
    from the empirical distribution of the CMU DSL dataset rather than zeros.
    Dwell times: log-normal (mean ~120ms, std ~50ms) converted to seconds.
    Ratios: uniform [0.2, 5.0] clamped to [0, 10].
    """
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

    rng = np.random.default_rng()
    # 31 dwell times in seconds (log-normal, realistic range 0.05–0.5 s)
    dwells = np.clip(rng.lognormal(mean=-2.1, sigma=0.4, size=31), 0.04, 0.6)
    # 10 speed-invariant ratios clamped to [0, 10]
    ratios = np.clip(rng.uniform(0.2, 5.0, size=10), 0.0, 10.0)
    impostor_features = np.concatenate([dwells, ratios]).tolist()

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
