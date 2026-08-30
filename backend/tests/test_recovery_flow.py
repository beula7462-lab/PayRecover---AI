import pytest
from fastapi.testclient import TestClient
from app.main import app as fastapi_app
from app.db.session import SessionLocal
from app.models.transaction import Transaction
from seed import seed_database

@pytest.fixture(autouse=True)
def reset_db_state():
    seed_database()
    yield

client = TestClient(fastapi_app)

def test_execute_recovery_action_success():
    # Fetch a failed transaction from DB
    db = SessionLocal()
    failed_txn = db.query(Transaction).filter(Transaction.status == "FAILED").first()
    db.close()
    
    assert failed_txn is not None
    txn_id = failed_txn.transaction_id

    # Get initial metrics
    metrics_before = client.get("/api/dashboard/metrics").json()

    # Execute recovery action
    response = client.post(
        f"/api/transactions/{txn_id}/recover",
        json={"action": "RETRY_PAYMENT", "notes": "Automated test retry"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["SUCCESS", "FAILED", "SCHEDULED", "SENT"]
    assert data["updated_transaction"]["transaction_id"] == txn_id

    # If action succeeded in recovering payment, verify metric updates
    if data["updated_transaction"]["status"] == "RECOVERED":
        metrics_after = client.get("/api/dashboard/metrics").json()
        assert metrics_after["revenue_recovered"] > metrics_before["revenue_recovered"]

def test_already_recovered_returns_409():
    db = SessionLocal()
    recovered_txn = db.query(Transaction).filter(Transaction.status == "RECOVERED").first()
    db.close()

    assert recovered_txn is not None

    response = client.post(
        f"/api/transactions/{recovered_txn.transaction_id}/recover",
        json={"action": "RETRY_PAYMENT"}
    )
    assert response.status_code == 409
    assert "already been recovered" in response.json()["detail"]

def test_invalid_action_returns_400():
    db = SessionLocal()
    failed_txn = db.query(Transaction).filter(Transaction.status == "FAILED").first()
    db.close()

    response = client.post(
        f"/api/transactions/{failed_txn.transaction_id}/recover",
        json={"action": "INVALID_ACTION_TYPE"}
    )
    assert response.status_code == 400
