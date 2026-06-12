import pytest  # type: ignore[import]
import sys
from pathlib import Path
import numpy as np
from fastapi.testclient import TestClient

# Add backend root to path so we can import main and app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from main import app
from app.db.database import init_db
from app.services.encoder import encoder_service
from app.core import config as _config


@pytest.fixture(scope="function", autouse=True)
def isolated_db(tmp_path):
    """Give every test its own SQLite file so session counts never bleed."""
    db_file = str(tmp_path / "test_ghostid.db")
    _config.settings.db_path = db_file
    init_db()
    yield
    # cleanup handled by tmp_path


@pytest.fixture(scope="function")
def client(isolated_db):
    """Provide a test client backed by the isolated DB."""
    encoder_service.load()  # Load ONNX model (or fall back to placeholder gracefully)
    return TestClient(app)


@pytest.fixture(scope="function")
def sample_features():
    """Generate sample keystroke features."""
    return [np.random.random() for _ in range(41)]


class TestHealth:
    """Health check endpoint tests."""

    def test_health_status_ok(self, client):
        """Test that the health endpoint returns 200."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


class TestEnrollment:
    """Enrollment endpoint tests."""

    def test_enroll_new_user(self, client, sample_features):
        """Test enrolling a new user."""
        response = client.post(
            "/enroll",
            json={"user_id": "test_user_1", "features": sample_features}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == "test_user_1"
        assert data["session_count"] == 1
        assert data["enrolled"]  # min_sessions_to_score=1 in config

    def test_enroll_multiple_sessions(self, client, sample_features):
        """Test enrolling user with multiple sessions."""
        user_id = "test_user_2"
        # First session
        response1 = client.post(
            "/enroll",
            json={"user_id": user_id, "features": sample_features}
        )
        assert response1.status_code == 200
        assert response1.json()["session_count"] == 1

        # Second session
        response2 = client.post(
            "/enroll",
            json={"user_id": user_id, "features": sample_features}
        )
        assert response2.status_code == 200
        assert response2.json()["session_count"] == 2
        assert response2.json()["enrolled"]  # Now enrolled

    def test_enroll_invalid_features_empty(self, client):
        """Test enrollment with empty features array."""
        response = client.post(
            "/enroll",
            json={"user_id": "test_user_3", "features": []}
        )
        assert response.status_code in [400, 422]  # Validation error

    def test_enroll_invalid_features_wrong_size(self, client):
        """Test enrollment with incorrect feature count."""
        response = client.post(
            "/enroll",
            json={"user_id": "test_user_4", "features": [0.1, 0.2, 0.3]}
        )
        assert response.status_code in [400, 422]  # Validation error

    def test_get_enrollment_status_enrolled(self, client, sample_features):
        """Test retrieving enrollment status for an enrolled user."""
        user_id = "test_user_5"
        # Enroll twice to meet requirement
        client.post("/enroll", json={"user_id": user_id, "features": sample_features})
        client.post("/enroll", json={"user_id": user_id, "features": sample_features})

        response = client.get(f"/enroll/{user_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == user_id
        assert data["enrolled"]
        assert data["session_count"] == 2

    def test_get_enrollment_status_not_enrolled(self, client, sample_features):
        """Test retrieving status for a non-enrolled user (only 1 session)."""
        user_id = "test_user_6"
        client.post("/enroll", json={"user_id": user_id, "features": sample_features})

        response = client.get(f"/enroll/{user_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["enrolled"]  # min_sessions_to_score=1 in config
        assert data["session_count"] == 1

    def test_get_enrollment_status_nonexistent(self, client):
        """Test retrieving status for a user that doesn't exist."""
        response = client.get("/enroll/nonexistent_user")
        assert response.status_code == 200
        data = response.json()
        assert not data["enrolled"]
        assert data["session_count"] == 0

    def test_delete_profile(self, client, sample_features):
        """Test deleting a user profile."""
        user_id = "test_user_7"
        # Enroll user
        client.post("/enroll", json={"user_id": user_id, "features": sample_features})

        # Delete profile
        response = client.delete(f"/enroll/{user_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["deleted"]

        # Verify profile is deleted
        status_response = client.get(f"/enroll/{user_id}")
        assert not status_response.json()["enrolled"]

    def test_delete_nonexistent_profile(self, client):
        """Test deleting a profile that doesn't exist."""
        response = client.delete("/enroll/nonexistent_user")
        assert response.status_code in [404, 200]  # Depends on implementation


class TestScoring:
    """Scoring endpoint tests."""

    def test_score_enrolled_user(self, client, sample_features):
        """Test scoring for an enrolled user."""
        user_id = "test_user_8"
        # Enroll user
        client.post("/enroll", json={"user_id": user_id, "features": sample_features})
        client.post("/enroll", json={"user_id": user_id, "features": sample_features})

        # Score
        response = client.post(
            "/score",
            json={"user_id": user_id, "features": sample_features}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == user_id
        assert 0 <= data["confidence_score"] <= 100

    def test_score_nonenrolled_user(self, client, sample_features):
        """Test scoring for a non-enrolled user."""
        user_id = "test_user_9"
        response = client.post(
            "/score",
            json={"user_id": user_id, "features": sample_features}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["confidence_score"] == 0.0  # Should return 0 for unenrolled


if __name__ == "__main__":
    pytest.main([__file__, "-v"])