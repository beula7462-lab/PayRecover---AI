import pytest
from fastapi.testclient import TestClient
from app.main import app as fastapi_app
from app.db.session import SessionLocal
from app.models.transaction import Transaction
from seed import seed_database

@pytest.fixture(scope="module", autouse=True)
def setup_test_data():
    # Run database seed to populate clean test records
    seed_database()
    yield

client = TestClient(fastapi_app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_dashboard_metrics():
    response = client.get("/api/dashboard/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "revenue_at_risk" in data
    assert "revenue_recovered" in data
    assert "recovery_rate" in data
    assert data["failed_payments"] > 0
    assert data["total_transactions"] >= 50

def test_dashboard_insights():
    response = client.get("/api/dashboard/insights")
    assert response.status_code == 200
    data = response.json()
    assert "insights" in data
    assert len(data["insights"]) > 0

def test_list_transactions_pagination_and_search():
    response = client.get("/api/transactions?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 50
    assert len(data["items"]) == 10

def test_get_transaction_by_id():
    response = client.get("/api/transactions/TXN1001")
    assert response.status_code == 200
    data = response.json()
    assert data["transaction"]["transaction_id"] == "TXN1001"
    assert "ai_analysis" in data

def test_get_transaction_not_found():
    response = client.get("/api/transactions/TXN999999")
    assert response.status_code == 404

def test_get_recovery_queue():
    response = client.get("/api/recovery-queue")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    # Confirm queue is sorted by priority score descending
    first_score = data[0]["transaction"]["priority_score"]
    second_score = data[1]["transaction"]["priority_score"]
    assert first_score >= second_score

def test_get_analytics_overview():
    response = client.get("/api/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert "total_failed_amount" in data
    assert "failure_distribution" in data
    assert len(data["failure_distribution"]) > 0
