from typing import List
from pydantic import BaseModel

class TrendPoint(BaseModel):
    date: str
    failed_amount: float
    recovered_amount: float
    recovery_rate: float

class FailureDistribution(BaseModel):
    reason: str
    count: int
    amount_at_risk: float
    percentage: float

class PaymentMethodPerformance(BaseModel):
    payment_method: str
    total_count: int
    failed_amount: float
    recovered_amount: float
    recovery_rate: float

class AnalyticsOverviewResponse(BaseModel):
    total_failed_amount: float
    total_recovered_amount: float
    overall_recovery_rate: float
    total_failed_count: int
    total_recovered_count: int
    recovery_trends: List[TrendPoint]
    failure_distribution: List[FailureDistribution]
    payment_method_performance: List[PaymentMethodPerformance]
