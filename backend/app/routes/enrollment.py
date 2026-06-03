from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    DeleteResponse,
    EnrollRequest,
    EnrollResponse,
    EnrollStatus,
)
from app.services.enrollment import enrollment_service

router = APIRouter(prefix="/enroll", tags=["enrollment"])


@router.post("", response_model=EnrollResponse)
async def enroll(req: EnrollRequest):
    result = enrollment_service.enroll(req.user_id, req.features)
    return EnrollResponse(user_id=req.user_id, **result)


@router.get("/{user_id}", response_model=EnrollStatus)
async def get_enrollment_status(user_id: str):
    status = enrollment_service.get_status(user_id)
    return EnrollStatus(user_id=user_id, **status)


@router.delete("/{user_id}", response_model=DeleteResponse)
async def delete_profile(user_id: str):
    deleted = enrollment_service.delete(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Profile not found")
    return DeleteResponse(user_id=user_id, deleted=True)
