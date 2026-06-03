import sqlite3

from fastapi import APIRouter

from app.db.database import get_db
from app.models.schemas import HealthResponse
from app.services.encoder import encoder_service

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health():
    db_ok = False
    try:
        with get_db() as conn:
            conn.execute("SELECT 1")
        db_ok = True
    except sqlite3.Error:
        db_ok = False

    return HealthResponse(
        status="ok" if db_ok else "degraded",
        version="3.0.0",
        encoder_loaded=encoder_service.encoder_loaded,
        placeholder_mode=encoder_service.placeholder_mode,
        db_ok=db_ok,
    )
