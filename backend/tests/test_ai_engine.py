import datetime
from app.ai.recovery_engine import AIRecoveryEngine

def test_temporary_bank_error_high_probability():
    res = AIRecoveryEngine.evaluate_transaction(
        amount=25000.0,
        failure_reason="Temporary Bank Error",
        payment_method="UPI",
        attempt_count=1,
        transaction_date=datetime.datetime.utcnow()
    )
    assert res["recovery_probability"] >= 0.80
    assert res["recommended_action"] == "RETRY_PAYMENT"
    assert res["priority_score"] > 50.0

def test_insufficient_funds_recommendation():
    res = AIRecoveryEngine.evaluate_transaction(
        amount=15000.0,
        failure_reason="Insufficient Funds",
        payment_method="Credit Card",
        attempt_count=1,
        transaction_date=datetime.datetime.utcnow()
    )
    assert res["recommended_action"] == "SEND_PAYMENT_LINK"

def test_repeated_attempts_penalty():
    res_1 = AIRecoveryEngine.evaluate_transaction(
        amount=10000.0,
        failure_reason="Temporary Bank Error",
        payment_method="Credit Card",
        attempt_count=1,
        transaction_date=datetime.datetime.utcnow()
    )
    res_4 = AIRecoveryEngine.evaluate_transaction(
        amount=10000.0,
        failure_reason="Temporary Bank Error",
        payment_method="Credit Card",
        attempt_count=4,
        transaction_date=datetime.datetime.utcnow()
    )
    assert res_4["recovery_probability"] < res_1["recovery_probability"]

def test_priority_score_mapping():
    # High value transaction should yield HIGH priority
    res_high = AIRecoveryEngine.evaluate_transaction(
        amount=95000.0,
        failure_reason="Temporary Bank Error",
        payment_method="UPI",
        attempt_count=1,
        transaction_date=datetime.datetime.utcnow()
    )
    assert res_high["priority"] == "HIGH"
    assert res_high["priority_score"] >= 75.0
