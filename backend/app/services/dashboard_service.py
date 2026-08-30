import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.transaction import Transaction
from app.schemas.dashboard import DashboardMetricsResponse, InsightItem, DashboardInsightsResponse

class DashboardService:

    @staticmethod
    def get_metrics(db: Session) -> DashboardMetricsResponse:
        # SUM(amount WHERE status IN ('FAILED', 'PENDING_RECOVERY', 'ACTION_EXECUTED'))
        risk_query = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
            .filter(Transaction.status.in_(["FAILED", "PENDING_RECOVERY", "ACTION_EXECUTED"]))
            .scalar()
        )
        revenue_at_risk = float(risk_query)

        # SUM(amount WHERE status = 'RECOVERED')
        recovered_query = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
            .filter(Transaction.status == "RECOVERED")
            .scalar()
        )
        revenue_recovered = float(recovered_query)

        total_recoverable = revenue_at_risk + revenue_recovered
        recovery_rate = (revenue_recovered / total_recoverable * 100.0) if total_recoverable > 0 else 0.0

        # Unresolved count
        failed_count = (
            db.query(func.count(Transaction.id))
            .filter(Transaction.status.in_(["FAILED", "PENDING_RECOVERY", "ACTION_EXECUTED"]))
            .scalar()
        )

        total_count = db.query(func.count(Transaction.id)).scalar()

        return DashboardMetricsResponse(
            revenue_at_risk=round(revenue_at_risk, 2),
            revenue_recovered=round(revenue_recovered, 2),
            recovery_rate=round(recovery_rate, 1),
            failed_payments=failed_count or 0,
            total_transactions=total_count or 0
        )

    @staticmethod
    def get_insights(db: Session) -> DashboardInsightsResponse:
        insights = []

        # 1. High Value Risk Transaction
        high_val_txn = (
            db.query(Transaction)
            .filter(Transaction.status.in_(["FAILED", "PENDING_RECOVERY"]))
            .order_by(Transaction.amount.desc())
            .first()
        )
        if high_val_txn:
            insights.append(InsightItem(
                id="insight_high_val",
                type="HIGH_VALUE",
                title=f"High-Value Risk: ₹{high_val_txn.amount:,.2f}",
                description=f"Transaction {high_val_txn.transaction_id} from {high_val_txn.customer_name} requires immediate action due to high revenue impact.",
                impact=f"₹{high_val_txn.amount:,.2f} at risk",
                action_label="View Transaction",
                target_transaction_id=high_val_txn.transaction_id,
                severity="CRITICAL"
            ))

        # 2. Most Common Failure Reason
        top_reason = (
            db.query(Transaction.failure_reason, func.count(Transaction.id).label("cnt"))
            .filter(Transaction.status.in_(["FAILED", "PENDING_RECOVERY"]))
            .group_by(Transaction.failure_reason)
            .order_by(func.count(Transaction.id).desc())
            .first()
        )
        if top_reason:
            reason_name, cnt = top_reason
            insights.append(InsightItem(
                id="insight_top_reason",
                type="FREQUENT_FAILURE",
                title=f"Primary Bottleneck: {reason_name}",
                description=f"'{reason_name}' is responsible for {cnt} unresolved payment failures.",
                impact=f"{cnt} transactions affected",
                action_label="Filter Payments",
                target_transaction_id=None,
                severity="WARNING"
            ))

        # 3. Highest Recovery Probability Candidate
        high_prob_txn = (
            db.query(Transaction)
            .filter(Transaction.status.in_(["FAILED", "PENDING_RECOVERY"]))
            .order_by(Transaction.recovery_probability.desc(), Transaction.amount.desc())
            .first()
        )
        if high_prob_txn:
            prob_pct = int(high_prob_txn.recovery_probability * 100)
            insights.append(InsightItem(
                id="insight_high_prob",
                type="HIGH_PROBABILITY",
                title=f"Quick Win Opportunity: {prob_pct}% Recovery Chance",
                description=f"Transaction {high_prob_txn.transaction_id} (₹{high_prob_txn.amount:,.2f}) has a {prob_pct}% chance of recovery via {high_prob_txn.recommended_action}.",
                impact=f"High success likelihood",
                action_label="Execute Recovery",
                target_transaction_id=high_prob_txn.transaction_id,
                severity="SUCCESS"
            ))

        # 4. Payment Method Alert
        top_method = (
            db.query(Transaction.payment_method, func.count(Transaction.id).label("cnt"))
            .filter(Transaction.status.in_(["FAILED", "PENDING_RECOVERY"]))
            .group_by(Transaction.payment_method)
            .order_by(func.count(Transaction.id).desc())
            .first()
        )
        if top_method:
            method_name, cnt = top_method
            insights.append(InsightItem(
                id="insight_top_method",
                type="METHOD_ALERT",
                title=f"Channel Focus: {method_name}",
                description=f"{method_name} accounts for the highest volume of payment disruptions ({cnt} failures).",
                impact=f"Concentrated channel risk",
                action_label="Review Method Analytics",
                target_transaction_id=None,
                severity="INFO"
            ))

        return DashboardInsightsResponse(
            generated_at=datetime.datetime.utcnow().isoformat(),
            insights=insights
        )
