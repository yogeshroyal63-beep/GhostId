from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging
from app.db.database import init_db
from app.routes import enrollment, health, score
from app.services.encoder import encoder_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    init_db()
    encoder_service.load()
    yield


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
