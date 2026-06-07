import asyncio
import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging
from app.db.database import init_db, prune_old_sessions
from app.routes import enrollment, health, score
from app.services.encoder import encoder_service

logger = logging.getLogger(__name__)


async def _prune_loop() -> None:
    """Background task: prune stale sessions every 24 hours."""
    while True:
        await asyncio.sleep(86_400)
        try:
            removed = prune_old_sessions()
            logger.info("Session pruning complete — %d rows removed.", removed)
        except Exception as exc:
            logger.warning("Session pruning failed: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    init_db()
    encoder_service.load()
    # Run an initial prune on startup then schedule daily
    try:
        removed = prune_old_sessions()
        if removed:
            logger.info("Startup prune: removed %d stale session rows.", removed)
    except Exception as exc:
        logger.warning("Startup prune failed: %s", exc)
    task = asyncio.create_task(_prune_loop())
    yield
    task.cancel()


app = FastAPI(
    title="GhostID API",
    description="Continuous Behavioral Session Verification",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(enrollment.router)
app.include_router(score.router)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)
