import datetime
from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.models.transaction import Transaction
from app.schemas.analytics import TrendPoint, FailureDistribution, PaymentMethodPerformance, AnalyticsOverviewResponse

class AnalyticsService:

    @staticmethod
    def get_overview(db: Session) -> AnalyticsOverviewResponse:
        # Totals
        total_failed_amt = float(
            db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
            .filter(Transaction.status.in_(["FAILED", "PENDING_RECOVERY", "ACTION_EXECUTED"]))
            .scalar()
        )

        total_recovered_amt = float(
            db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
            .filter(Transaction.status == "RECOVERED")
            .scalar()
        )

        tot_recoverable = total_failed_amt + total_recovered_amt
        overall_rate = (total_recovered_amt / tot_recoverable * 100.0) if tot_recoverable > 0 else 0.0

        total_failed_cnt = db.query(func.count(Transaction.id)).filter(Transaction.status.in_(["FAILED", "PENDING_RECOVERY", "ACTION_EXECUTED"])).scalar() or 0
        total_recovered_cnt = db.query(func.count(Transaction.id)).filter(Transaction.status == "RECOVERED").scalar() or 0

        # 1. Recovery Trends by Date (Python aggregation for cross-DB compatibility)
        all_txns = db.query(Transaction).all()
        trend_map: Dict[str, Dict[str, float]] = {}

        for tx in all_txns:
            d_str = tx.transaction_date.strftime("%Y-%m-%d") if tx.transaction_date else "N/A"
            if d_str not in trend_map:
                trend_map[d_str] = {"failed": 0.0, "recovered": 0.0}
            if tx.status in ["FAILED", "PENDING_RECOVERY", "ACTION_EXECUTED"]:
                trend_map[d_str]["failed"] += tx.amount
            elif tx.status == "RECOVERED":
                trend_map[d_str]["recovered"] += tx.amount

        trends: List[TrendPoint] = []
        for d_str in sorted(trend_map.keys()):
            f_sum = trend_map[d_str]["failed"]
            r_sum = trend_map[d_str]["recovered"]
            tot = f_sum + r_sum
            rate = (r_sum / tot * 100.0) if tot > 0 else 0.0
            trends.append(TrendPoint(
                date=d_str,
                failed_amount=round(f_sum, 2),
                recovered_amount=round(r_sum, 2),
                recovery_rate=round(rate, 1)
            ))

        # 2. Failure Reason Distribution
        failure_query = (
            db.query(
                Transaction.failure_reason,
                func.count(Transaction.id).label("cnt"),
                func.coalesce(func.sum(Transaction.amount), 0.0).label("amt")
            )
            .filter(Transaction.status.in_(["FAILED", "PENDING_RECOVERY", "ACTION_EXECUTED"]))
            .group_by(Transaction.failure_reason)
            .order_by(func.count(Transaction.id).desc())
            .all()
        )

        failure_dist: List[FailureDistribution] = []
        for reason, count, amount in failure_query:
            pct = (amount / total_failed_amt * 100.0) if total_failed_amt > 0 else 0.0
            failure_dist.append(FailureDistribution(
                reason=reason,
                count=count,
                amount_at_risk=round(float(amount), 2),
                percentage=round(pct, 1)
            ))

        # 3. Payment Method Performance
        method_query = (
            db.query(
                Transaction.payment_method,
                func.count(Transaction.id).label("tot_cnt"),
                func.coalesce(func.sum(case((Transaction.status.in_(["FAILED", "PENDING_RECOVERY", "ACTION_EXECUTED"]), Transaction.amount), else_=0.0)), 0.0).label("failed_sum"),
                func.coalesce(func.sum(case((Transaction.status == "RECOVERED", Transaction.amount), else_=0.0)), 0.0).label("recovered_sum")
            )
            .group_by(Transaction.payment_method)
            .all()
        )

        method_perf: List[PaymentMethodPerformance] = []
        for method, tot_cnt, f_sum, r_sum in method_query:
            tot_val = float(f_sum) + float(r_sum)
            r_rate = (float(r_sum) / tot_val * 100.0) if tot_val > 0 else 0.0
            method_perf.append(PaymentMethodPerformance(
                payment_method=method,
                total_count=tot_cnt,
                failed_amount=round(float(f_sum), 2),
                recovered_amount=round(float(r_sum), 2),
                recovery_rate=round(r_rate, 1)
            ))

        return AnalyticsOverviewResponse(
            total_failed_amount=round(total_failed_amt, 2),
            total_recovered_amount=round(total_recovered_amt, 2),
            overall_recovery_rate=round(overall_rate, 1),
            total_failed_count=total_failed_cnt,
            total_recovered_count=total_recovered_cnt,
            recovery_trends=trends,
            failure_distribution=failure_dist,
            payment_method_performance=method_perf
        )
