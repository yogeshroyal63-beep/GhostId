from pydantic import BaseModel, Field


class EnrollRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    features: list[float] = Field(..., min_length=41, max_length=41)


class EnrollResponse(BaseModel):
    user_id: str
    session_count: int
    enrolled: bool
    message: str


class EnrollStatus(BaseModel):
    user_id: str
    enrolled: bool
    session_count: int


class ScoreRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    features: list[float] = Field(..., min_length=41, max_length=41)


class ScoreResponse(BaseModel):
    user_id: str
    confidence_score: float
    tier: str
    action: str
    enrolled: bool
    session_count: int
    placeholder_mode: bool = False


class ImpostorSimResponse(BaseModel):
    user_id: str
    confidence_score: float
    tier: str
    action: str
    simulated: bool
    placeholder_mode: bool = False


class DeleteResponse(BaseModel):
    user_id: str
    deleted: bool


class HealthResponse(BaseModel):
    status: str
    version: str
    encoder_loaded: bool
    placeholder_mode: bool
    db_ok: bool
