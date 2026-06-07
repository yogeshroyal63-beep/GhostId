"""
Fernet-based encryption for stored embedding vectors.

When EMBEDDING_ENCRYPTION_KEY is set in the environment, all embeddings
are encrypted before being written to the DB and decrypted on read.
If the key is empty (dev mode), embeddings are stored as plain JSON.
"""
import json
import logging

import numpy as np

from app.core.config import settings

logger = logging.getLogger(__name__)

_fernet = None


def _get_fernet():
    global _fernet
    if _fernet is not None:
        return _fernet
    if not settings.embedding_encryption_key:
        return None
    try:
        from cryptography.fernet import Fernet
        _fernet = Fernet(settings.embedding_encryption_key.encode())
        logger.info("Embedding encryption active (Fernet).")
    except Exception as exc:
        logger.warning("Failed to initialise Fernet encryption: %s — storing plain JSON.", exc)
        _fernet = None
    return _fernet


def encode_embedding(embedding: np.ndarray) -> str:
    """Serialise a numpy array to a (possibly encrypted) string for DB storage."""
    payload = json.dumps(embedding.tolist())
    f = _get_fernet()
    if f is None:
        return payload
    return f.encrypt(payload.encode()).decode()


def decode_embedding(stored: str) -> np.ndarray:
    """Deserialise a stored string back to a numpy array."""
    f = _get_fernet()
    if f is None:
        return np.array(json.loads(stored))
    try:
        payload = f.decrypt(stored.encode()).decode()
        return np.array(json.loads(payload))
    except Exception:
        # Fallback: maybe the DB has unencrypted rows from before the key was set.
        logger.warning("Fernet decryption failed — trying plain JSON fallback.")
        return np.array(json.loads(stored))
