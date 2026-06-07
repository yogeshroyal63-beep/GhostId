from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    port: int = 8000
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    db_path: str = "ghostid.db"
    encoder_path: str = "ml/ghostid_encoder.onnx"
    scaler_path: str = "ml/scaler_params.json"
    min_sessions_to_score: int = 1
    ema_alpha: float = 0.08
    silent_pass_threshold: float = 85.0
    soft_nudge_threshold: float = 70.0
    typing_challenge_threshold: float = 40.0
    log_level: str = "INFO"
    placeholder_mode: bool = True

    # --- Security ---
    # Set via env: GHOSTID_API_KEY=your-secret-key
    # If empty, auth is disabled (dev-only — never leave empty in production).
    api_key: str = ""

    # 32-byte URL-safe base64 key for Fernet embedding encryption.
    # Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    # If empty, embeddings are stored as plain JSON (dev mode).
    embedding_encryption_key: str = ""

    # --- Rate limiting ---
    # Max requests per user_id per minute on /enroll and /score endpoints.
    rate_limit_per_minute: int = 30

    # --- Session hygiene ---
    # Raw keystroke sessions older than this many days are pruned automatically.
    session_retention_days: int = 30
    # Only keep the most recent N sessions per user for baseline computation.
    max_sessions_per_user: int = 20

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors(cls, value):
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


settings = Settings()
