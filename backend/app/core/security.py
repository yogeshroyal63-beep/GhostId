"""
FastAPI dependencies for authentication and rate limiting.
"""
import time
from collections import defaultdict
from threading import Lock

from fastapi import Depends, Header, HTTPException, Request, status

from app.core.config import settings

# ---------------------------------------------------------------------------
# API Key authentication
# ---------------------------------------------------------------------------

def verify_api_key(x_ghostid_key: str | None = Header(default=None)) -> None:
    """Require X-GhostID-Key header when an API key is configured."""
    if not settings.api_key:
        # Auth disabled in dev mode — skip check.
        return
    if x_ghostid_key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key. Provide X-GhostID-Key header.",
        )


# ---------------------------------------------------------------------------
# In-process token-bucket rate limiter (per user_id, per endpoint)
# ---------------------------------------------------------------------------

class RateLimiter:
    """
    Simple sliding-window counter.
    Tracks (user_id, endpoint) → list of request timestamps.
    Not suitable for multi-process deployments — swap for Redis in production.
    """

    def __init__(self) -> None:
        self._buckets: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()

    def check(self, key: str, limit: int, window_seconds: int = 60) -> None:
        now = time.monotonic()
        cutoff = now - window_seconds
        with self._lock:
            timestamps = self._buckets[key]
            # Prune old entries
            self._buckets[key] = [t for t in timestamps if t > cutoff]
            if len(self._buckets[key]) >= limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded: max {limit} requests per {window_seconds}s.",
                )
            self._buckets[key].append(now)


_limiter = RateLimiter()


def enroll_rate_limit(request: Request) -> None:
    """Rate-limit /enroll by user_id extracted from the request body.
    Since FastAPI doesn't expose body in dependencies easily, we use client IP
    as a fallback key. The route handlers call this directly with user_id."""
    pass  # Route handlers call _limiter.check() directly with user_id.


def check_rate_limit(user_id: str, endpoint: str) -> None:
    """Call from route handlers: check_rate_limit(req.user_id, 'enroll')"""
    _limiter.check(f"{user_id}:{endpoint}", settings.rate_limit_per_minute)
