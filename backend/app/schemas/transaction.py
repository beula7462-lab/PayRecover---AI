from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class TransactionBase(BaseModel):
    transaction_id: str
    customer_name: str
    amount: float
    currency: str = "INR"
    payment_method: str
    failure_reason: str
    status: str = "FAILED"
    attempt_count: int = 1
    transaction_date: datetime

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    recovery_probability: float
    priority_score: float
    priority: str
    recommended_action: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PaginatedTransactions(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
