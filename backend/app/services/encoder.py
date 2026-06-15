import hashlib
import json
import logging
from pathlib import Path


import numpy as np

from app.core.config import settings

logger = logging.getLogger(__name__)

PLACEHOLDER_WARNING = (
    "⚠ GhostID running in PLACEHOLDER mode — scores are non-functional. "
    "Run ml/notebooks/ghostid_v3_training.ipynb on Kaggle and copy "
    "ghostid_encoder.onnx + scaler_params.json to backend/ml/"
)


class EncoderService:
    """ONNX encoder wrapper with deterministic placeholder fallback for development."""

    def __init__(self) -> None:
        self._session = None
        self._mean: np.ndarray | None = None
        self._scale: np.ndarray | None = None
        self.placeholder_mode = True

    def load(self) -> None:
    # Resolve paths relative to this file's location, not the process CWD
        base_dir = Path(__file__).resolve().parent.parent.parent  # backend/
        encoder_path = base_dir / settings.encoder_path
        scaler_path = base_dir / settings.scaler_path
        if scaler_path.exists():
            with open(scaler_path, encoding="utf-8") as handle:
                params = json.load(handle)
            self._mean = np.array(params["mean"], dtype=np.float32)
            self._scale = np.array(params["scale"], dtype=np.float32)

        if encoder_path.exists():
            try:
                import onnxruntime as ort

                self._session = ort.InferenceSession(
                    str(encoder_path),
                    providers=["CPUExecutionProvider"],
                )
                self.placeholder_mode = False
                logger.info("ONNX encoder loaded from %s", encoder_path)
            except Exception as exc:
                logger.warning("%s ONNX load failed: %s", PLACEHOLDER_WARNING, exc)
                self.placeholder_mode = True
        else:
            logger.warning(PLACEHOLDER_WARNING)
            self.placeholder_mode = True

    def warn_if_placeholder_on_score(self) -> None:
        """Log placeholder warning on every /score request when ONNX is not loaded."""
        if self.placeholder_mode:
            logger.warning(PLACEHOLDER_WARNING)

    @property
    def encoder_loaded(self) -> bool:
        return self._session is not None and not self.placeholder_mode

    def _normalize_features(self, features: list[float]) -> np.ndarray:
        x = np.array(features, dtype=np.float32)
        if self._mean is not None and self._scale is not None:
            x = (x - self._mean) / (self._scale + 1e-8)
        return x

    def _placeholder_embedding(self, features: list[float]) -> np.ndarray:
        """Smooth placeholder: similar features → similar embeddings (demo-only)."""
        x = np.array(features, dtype=np.float32)
        # Use a fixed seed for the projection matrix (reproducible across calls)
        rng = np.random.default_rng(42)
        projection = rng.standard_normal((len(x), 128)).astype(np.float32)
        embedding = x @ projection  # linear projection preserves similarity
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
        return embedding

    def encode(self, features: list[float]) -> np.ndarray:
        x = self._normalize_features(features)

        if self._session is not None and not self.placeholder_mode:
            batch = x.reshape(1, 1, 41)
            result = self._session.run(None, {"features": batch})
            embedding = result[0][0].astype(np.float32)
        else:
            embedding = self._placeholder_embedding(features)

        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
        return embedding


encoder_service = EncoderService()
