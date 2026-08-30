import datetime
from typing import Dict, Any, List, Tuple

class AIRecoveryEngine:
    """
    Explainable AI-assisted recovery scoring engine for digital payment failures.
    
    Evaluates failure characteristics, transaction value, payment channel historical success,
    attempt frequency, and age to determine:
    1. Recovery Probability (0.0 to 1.0)
    2. Priority Score (0 to 100)
    3. Urgency / Priority (HIGH, MEDIUM, LOW)
    4. Recommended Action (RETRY_PAYMENT, SEND_PAYMENT_LINK, SCHEDULE_REMINDER)
    5. Detailed human-readable explanations.
    """

    FAILURE_REASON_WEIGHTS = {
        "Temporary Bank Error": 0.88,
        "Network Error": 0.82,
        "Timeout": 0.78,
        "Insufficient Funds": 0.58,
        "Expired Card": 0.38,
        "Invalid Payment Details": 0.30,
        "Bank Declined": 0.42,
    }

    PAYMENT_METHOD_WEIGHTS = {
        "UPI": 1.05,
        "Credit Card": 1.00,
        "Debit Card": 0.95,
        "Net Banking": 0.90,
        "Wallet": 0.85,
    }

    @classmethod
    def evaluate_transaction(
        cls,
        amount: float,
        failure_reason: str,
        payment_method: str,
        attempt_count: int,
        transaction_date: datetime.datetime
    ) -> Dict[str, Any]:
        explanations: List[str] = []
        
        # 1. Base Probability from Failure Reason
        base_prob = cls.FAILURE_REASON_WEIGHTS.get(failure_reason, 0.50)
        explanations.append(f"Base probability of {int(base_prob*100)}% based on failure category '{failure_reason}'.")
        
        # 2. Payment Method Multiplier
        method_mult = cls.PAYMENT_METHOD_WEIGHTS.get(payment_method, 1.00)
        prob = base_prob * method_mult
        if method_mult > 1.0:
            explanations.append(f"UPI payment method increases re-attempt success rate.")
        elif method_mult < 1.0:
            explanations.append(f"{payment_method} has slightly higher drop-off rates.")
            
        # 3. Attempt Count Penalty (-8% per attempt beyond 1)
        if attempt_count > 1:
            penalty = (attempt_count - 1) * 0.08
            prob -= penalty
            explanations.append(f"Repeated failures ({attempt_count} attempts) reduce recovery probability by {int(penalty*100)}%.")
            
        # 4. Age Penalty (-5% per 24 hours unresolved)
        now = datetime.datetime.utcnow()
        age_hours = (now - transaction_date).total_seconds() / 3600.0 if transaction_date else 0.0
        if age_hours > 24:
            days_old = age_hours / 24.0
            age_penalty = min(0.25, days_old * 0.05)
            prob -= age_penalty
            explanations.append(f"Transaction age ({int(days_old)} days) reduces probability by {int(age_penalty*100)}%.")

        # Clamp probability between 0.05 and 0.98
        recovery_probability = round(max(0.05, min(0.98, prob)), 2)

        # 5. Priority Score Calculation (0 - 100)
        # Component A: Amount Score (0 - 100)
        # Normalized: ₹1,000 -> 20, ₹10,000 -> 60, ₹50,000+ -> 100
        amount_score = min(100.0, (amount / 50000.0) * 100.0)
        
        # Component B: Recovery Probability Score (0 - 100)
        prob_score = recovery_probability * 100.0
        
        # Component C: Urgency Score (0 - 100) based on age & value
        urgency_score = min(100.0, (age_hours / 48.0) * 50.0 + (amount_score * 0.5))
        
        # Component D: Failure Reason Score (0 - 100)
        reason_score = base_prob * 100.0

        # Weighted Priority Formula
        raw_priority_score = (
            (amount_score * 0.35) +
            (prob_score * 0.40) +
            (urgency_score * 0.15) +
            (reason_score * 0.10)
        )
        priority_score = round(max(0.0, min(100.0, raw_priority_score)), 1)

        # Map to Priority Level
        if priority_score >= 75.0:
            priority = "HIGH"
        elif priority_score >= 45.0:
            priority = "MEDIUM"
        else:
            priority = "LOW"

        # 6. Action Recommendation Logic
        if failure_reason in ["Temporary Bank Error", "Network Error", "Timeout"]:
            recommended_action = "RETRY_PAYMENT"
            explanations.append("Recommended action: Auto-retry payment because failure appears transient.")
        elif failure_reason in ["Insufficient Funds"]:
            if attempt_count >= 3:
                recommended_action = "SCHEDULE_REMINDER"
                explanations.append("Recommended action: Schedule a reminder to avoid spamming payment retries.")
            else:
                recommended_action = "SEND_PAYMENT_LINK"
                explanations.append("Recommended action: Send smart payment link so customer can retry after funding account.")
        elif failure_reason in ["Expired Card", "Invalid Payment Details"]:
            recommended_action = "SEND_PAYMENT_LINK"
            explanations.append("Recommended action: Send link requesting updated payment method credentials.")
        else:
            if priority == "HIGH":
                recommended_action = "SEND_PAYMENT_LINK"
                explanations.append("Recommended action: Send direct recovery payment link for high-value transaction.")
            else:
                recommended_action = "SCHEDULE_REMINDER"
                explanations.append("Recommended action: Schedule an automated reminder.")

        return {
            "recovery_probability": recovery_probability,
            "priority_score": priority_score,
            "priority": priority,
            "recommended_action": recommended_action,
            "explanation": explanations,
            "confidence_score": round(min(0.95, 0.70 + (attempt_count * 0.05)), 2)
        }
