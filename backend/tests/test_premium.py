import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.routers import premium


@pytest.fixture()
def client():
    premium._chosen_plan.clear()
    yield TestClient(app)
    premium._chosen_plan.clear()


def test_switching_plans_changes_premium_status(client: TestClient):
    free = client.post("/api/premium/subscribe", json={"plan_id": "free"}).json()
    assert free["plan_id"] == "free"
    assert free["is_premium"] is False
    assert client.get("/api/premium/status").json()["is_premium"] is False

    # back to the plan the demo shop started on: its trial comes back as it was
    paid = client.post("/api/premium/subscribe", json={"plan_id": "premium_monthly"}).json()
    assert paid["plan_id"] == "premium_monthly"
    assert paid["is_premium"] is True
    assert paid["next_billing_amount_thb"] == 199


def test_unknown_plan_is_rejected(client: TestClient):
    assert client.post("/api/premium/subscribe", json={"plan_id": "gold"}).status_code == 404
