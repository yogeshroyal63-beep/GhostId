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
