import hashlib
import json
import logging
from pathlib import Path

import numpy as np

from app.core.config import settings

logger = logging.getLogger(__name__)


class EncoderService:
    """ONNX encoder wrapper with deterministic placeholder fallback for development."""

    def __init__(self) -> None:
        self._session = None
        self._mean: np.ndarray | None = None
        self._scale: np.ndarray | None = None
        self.placeholder_mode = True

    def load(self) -> None:
        encoder_path = Path(settings.encoder_path)
        scaler_path = Path(settings.scaler_path)

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
                logger.warning("ONNX load failed, using placeholder: %s", exc)
                self.placeholder_mode = True
        else:
            logger.warning(
                "Encoder not found at %s — running in PLACEHOLDER mode",
                encoder_path,
            )
            self.placeholder_mode = True

    @property
    def encoder_loaded(self) -> bool:
        return self._session is not None and not self.placeholder_mode

    def _normalize_features(self, features: list[float]) -> np.ndarray:
        x = np.array(features, dtype=np.float32)
        if self._mean is not None and self._scale is not None:
            x = (x - self._mean) / (self._scale + 1e-8)
        return x

    def _placeholder_embedding(self, features: list[float]) -> np.ndarray:
        """Deterministic pseudo-embedding from feature hash (demo-only)."""
        payload = json.dumps([round(f, 6) for f in features]).encode()
        seed = int(hashlib.sha256(payload).hexdigest()[:8], 16)
        rng = np.random.default_rng(seed)
        embedding = rng.standard_normal(128).astype(np.float32)
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
