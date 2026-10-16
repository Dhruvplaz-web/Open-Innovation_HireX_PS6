import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.sync_service import sync_service

client = TestClient(app)

def test_sync_status():
    resp = client.get("/api/sync/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "active"
    assert data["sync_mode"] == "CANONICAL_DOMAIN_EVENT_BROKER"


def test_domain_event_publish_and_replay():
    # Publish domain event
    evt = sync_service.publish_domain_event(
        event_type="APPLICATION_SUBMITTED",
        entity_type="application",
        entity_id="app_test_101",
        version=1,
        payload={"student_id": "std_1", "opportunity_id": "opp_1"},
        actor_id="std_1",
        scope={"roles": ["student", "recruiter", "admin"], "student_id": "std_1", "is_public": True}
    )
    assert "event_id" in evt
    event_id = evt["event_id"]

    # Replay events
    resp = client.get("/api/sync/events?role=student&user_id=std_1")
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["status"] == "success"
    assert res_data["total_found"] >= 1
    found = any(e["event_id"] == event_id for e in res_data["events"])
    assert found is True


def test_sync_audit_logs():
    resp = client.get("/api/sync/audit-logs")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert "audit_logs" in data
    assert isinstance(data["audit_logs"], list)


def test_sync_notifications():
    resp = client.get("/api/sync/notifications?user_id=std_1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert "notifications" in data
    assert isinstance(data["notifications"], list)
