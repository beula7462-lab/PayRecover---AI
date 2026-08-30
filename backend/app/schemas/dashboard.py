from typing import List, Optional
from pydantic import BaseModel

class DashboardMetricsResponse(BaseModel):
    revenue_at_risk: float
    revenue_recovered: float
    recovery_rate: float
    failed_payments: int
    total_transactions: int

class InsightItem(BaseModel):
    id: str
    type: str  # HIGH_VALUE, FREQUENT_FAILURE, HIGH_PROBABILITY, METHOD_ALERT, SUMMARY
    title: str
    description: str
    impact: str
    action_label: Optional[str] = None
    target_transaction_id: Optional[str] = None
    severity: str  # CRITICAL, WARNING, INFO, SUCCESS

class DashboardInsightsResponse(BaseModel):
    generated_at: str
    insights: List[InsightItem]
