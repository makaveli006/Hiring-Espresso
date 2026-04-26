from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@patch("app.api.jobs.JobService")
def test_list_jobs_returns_200(mock_service_class):
    mock_service = MagicMock()
    mock_service.list_jobs.return_value = MagicMock(items=[], next_cursor=None, total=0)
    mock_service_class.return_value = mock_service

    response = client.get("/api/v1/jobs")
    assert response.status_code == 200


@patch("app.api.jobs.JobService")
def test_get_job_not_found(mock_service_class):
    mock_service = MagicMock()
    mock_service.get_job.return_value = None
    mock_service_class.return_value = mock_service

    response = client.get("/api/v1/jobs/nonexistent-id")
    assert response.status_code == 404


def test_save_job_requires_auth():
    response = client.post("/api/v1/jobs/some-id/save")
    assert response.status_code == 403
