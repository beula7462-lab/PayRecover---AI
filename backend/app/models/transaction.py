import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Index
from sqlalchemy.orm import relationship
from app.db.base import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(64), unique=True, index=True, nullable=False)
    customer_name = Column(String(128), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    payment_method = Column(String(64), index=True, nullable=False)
    failure_reason = Column(String(128), index=True, nullable=False)
    status = Column(String(32), index=True, default="FAILED", nullable=False)
    attempt_count = Column(Integer, default=1, nullable=False)
    transaction_date = Column(DateTime, index=True, default=datetime.datetime.utcnow, nullable=False)
    
    # AI Recovery Scoring attributes
    recovery_probability = Column(Float, default=0.5, nullable=False)
    priority_score = Column(Float, index=True, default=50.0, nullable=False)
    priority = Column(String(16), default="MEDIUM", nullable=False)  # HIGH, MEDIUM, LOW
    recommended_action = Column(String(64), default="RETRY_PAYMENT", nullable=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    recovery_actions = relationship("RecoveryAction", back_populates="transaction", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_status_priority", "status", "priority_score"),
        Index("idx_method_reason", "payment_method", "failure_reason"),
    )
