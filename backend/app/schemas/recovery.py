from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.transaction import TransactionResponse

class RecoveryActionRequest(BaseModel):
    action: str  # RETRY_PAYMENT, SEND_PAYMENT_LINK, SCHEDULE_REMINDER
    notes: Optional[str] = None

class RecoveryActionResponse(BaseModel):
    id: int
    transaction_id: str
    action_type: str
    status: str
    result: str
    notes: Optional[str] = None
    executed_at: datetime
    updated_transaction: TransactionResponse

    model_config = ConfigDict(from_attributes=True)

class AIScoringDetail(BaseModel):
    recovery_probability: float
    priority_score: float
    priority: str
    recommended_action: str
    explanation: List[str]
    confidence_score: float

class AIQueueItemResponse(BaseModel):
    transaction: TransactionResponse
    scoring_detail: AIScoringDetail
