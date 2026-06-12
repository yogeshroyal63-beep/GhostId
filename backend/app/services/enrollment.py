import json

import numpy as np

from app.core.config import settings
from app.core.crypto import decode_embedding, encode_embedding
from app.db.database import get_db
from app.services.encoder import encoder_service

ENROLL_MESSAGES = {
    1: "First session enrolled. One more session recommended.",
    2: "Profile established. Monitoring active.",
    3: "Strong profile. Full monitoring active.",
}


class EnrollmentService:
    def enroll(self, user_id: str, raw_features: list[float]) -> dict:
        with get_db() as conn:
            # Ensure the profile row exists before inserting into sessions
            # (sessions.user_id has a FK reference to profiles.user_id).
            conn.execute(
                """
                INSERT INTO profiles (user_id, embedding, session_count, enrolled)
                VALUES (?, '', 0, 0)
                ON CONFLICT(user_id) DO NOTHING
                """,
                (user_id,),
            )
            conn.execute(
                "INSERT INTO sessions (user_id, features) VALUES (?, ?)",
                (user_id, json.dumps(raw_features)),
            )
            rows = conn.execute(
                """
                SELECT features FROM sessions
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT ?
                """,
                (user_id, settings.max_sessions_per_user),
            ).fetchall()

            embeddings = [
                encoder_service.encode(json.loads(row["features"])) for row in rows
            ]
            baseline = np.mean(embeddings, axis=0)
            norm = np.linalg.norm(baseline)
            if norm > 0:
                baseline = baseline / norm

            count = len(embeddings)
            enrolled = count >= settings.min_sessions_to_score

            conn.execute(
                """
                INSERT INTO profiles (user_id, embedding, session_count, enrolled, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id) DO UPDATE SET
                    embedding = excluded.embedding,
                    session_count = excluded.session_count,
                    enrolled = excluded.enrolled,
                    updated_at = CURRENT_TIMESTAMP
                """,
                (user_id, encode_embedding(baseline), count, int(enrolled)),
            )

        message = ENROLL_MESSAGES.get(count, f"Profile updated ({count} sessions).")
        return {"session_count": count, "enrolled": enrolled, "message": message}

    def score(self, user_id: str, raw_features: list[float]) -> float:
        profile = self._get_profile(user_id)
        if profile is None:
            return 0.0

        baseline = decode_embedding(profile["embedding"])
        current = encoder_service.encode(raw_features)
        similarity = float(np.dot(current, baseline))
        return float(np.clip(similarity * 100, 0, 100))

    def update_baseline(self, user_id: str, raw_features: list[float]) -> None:
        profile = self._get_profile(user_id)
        if profile is None:
            return

        old_baseline = decode_embedding(profile["embedding"])
        current_emb = encoder_service.encode(raw_features)
        alpha = settings.ema_alpha
        new_baseline = old_baseline * (1 - alpha) + current_emb * alpha
        norm = np.linalg.norm(new_baseline)
        if norm > 0:
            new_baseline = new_baseline / norm

        with get_db() as conn:
            conn.execute(
                """
                UPDATE profiles SET embedding = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
                """,
                (encode_embedding(new_baseline), user_id),
            )

    def get_status(self, user_id: str) -> dict:
        profile = self._get_profile(user_id)
        if profile is None:
            return {"enrolled": False, "session_count": 0}
        return {
            "enrolled": bool(profile["enrolled"]),
            "session_count": profile["session_count"],
        }

    def delete(self, user_id: str) -> bool:
        with get_db() as conn:
            cursor = conn.execute(
                "DELETE FROM profiles WHERE user_id = ?", (user_id,)
            )
            return cursor.rowcount > 0

    def _get_profile(self, user_id: str):
        with get_db() as conn:
            return conn.execute(
                "SELECT * FROM profiles WHERE user_id = ?",
                (user_id,),
            ).fetchone()


enrollment_service = EnrollmentService()