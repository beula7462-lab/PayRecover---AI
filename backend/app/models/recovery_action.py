import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class RecoveryAction(Base):
    __tablename__ = "recovery_actions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(64), ForeignKey("transactions.transaction_id", ondelete="CASCADE"), index=True, nullable=False)
    action_type = Column(String(64), nullable=False)  # RETRY_PAYMENT, SEND_PAYMENT_LINK, SCHEDULE_REMINDER
    status = Column(String(32), nullable=False)       # SUCCESS, FAILED, SCHEDULED, SENT
    result = Column(String(128), nullable=False)
    notes = Column(Text, nullable=True)
    executed_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    transaction = relationship("Transaction", back_populates="recovery_actions")
