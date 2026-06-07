import sqlite3
from contextlib import contextmanager
from pathlib import Path

from app.core.config import settings


@contextmanager
def get_db():
    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    Path(settings.db_path).parent.mkdir(parents=True, exist_ok=True)
    with get_db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS profiles (
                user_id       TEXT PRIMARY KEY,
                embedding     TEXT NOT NULL,
                session_count INTEGER NOT NULL DEFAULT 0,
                enrolled      INTEGER NOT NULL DEFAULT 0,
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS sessions (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id       TEXT NOT NULL,
                features      TEXT NOT NULL,
                score         REAL,
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
            CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at);
            """
        )


def prune_old_sessions() -> int:
    """
    Delete sessions older than SESSION_RETENTION_DAYS and enforce
    MAX_SESSIONS_PER_USER per user, keeping only the most recent ones.
    Returns total rows deleted.
    """
    deleted = 0
    with get_db() as conn:
        # 1. Time-based pruning
        cursor = conn.execute(
            """
            DELETE FROM sessions
            WHERE created_at < datetime('now', ? || ' days')
            """,
            (f"-{settings.session_retention_days}",),
        )
        deleted += cursor.rowcount

        # 2. Per-user cap: keep only the most recent MAX_SESSIONS_PER_USER
        users = conn.execute("SELECT DISTINCT user_id FROM sessions").fetchall()
        for row in users:
            uid = row["user_id"]
            cursor = conn.execute(
                """
                DELETE FROM sessions
                WHERE user_id = ?
                  AND id NOT IN (
                      SELECT id FROM sessions
                      WHERE user_id = ?
                      ORDER BY created_at DESC
                      LIMIT ?
                  )
                """,
                (uid, uid, settings.max_sessions_per_user),
            )
            deleted += cursor.rowcount

    return deleted
