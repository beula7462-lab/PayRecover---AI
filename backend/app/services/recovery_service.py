import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.transaction import Transaction
from app.models.recovery_action import RecoveryAction
from app.schemas.recovery import RecoveryActionRequest, RecoveryActionResponse
from app.ai.recovery_engine import AIRecoveryEngine

class RecoveryService:

    @staticmethod
    def execute_recovery_action(
        db: Session,
        transaction_id: str,
        request: RecoveryActionRequest
    ) -> RecoveryActionResponse:
        # 1. Fetch transaction
        txn = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        if not txn:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction with ID '{transaction_id}' not found."
            )

        # 2. Check current status
        if txn.status == "RECOVERED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Transaction '{transaction_id}' has already been recovered and cannot be re-processed."
            )

        action_type = request.action.upper()
        allowed_actions = ["RETRY_PAYMENT", "SEND_PAYMENT_LINK", "SCHEDULE_REMINDER"]
        if action_type not in allowed_actions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid action '{action_type}'. Allowed actions: {', '.join(allowed_actions)}"
            )

        # 3. Deterministic simulated recovery execution based on recovery probability rule
        # Simulation rule: High/Medium probability retries resolve to RECOVERED.
        now = datetime.datetime.utcnow()
        notes = request.notes or f"Simulated recovery execution via {action_type}."

        if action_type in ["RETRY_PAYMENT", "SEND_PAYMENT_LINK"]:
            # If recovery probability >= 0.40, execution succeeds in recovering payment
            if txn.recovery_probability >= 0.40:
                action_status = "SUCCESS"
                action_result = f"Payment recovered successfully via {action_type}."
                txn.status = "RECOVERED"
            else:
                action_status = "FAILED"
                action_result = f"Recovery attempt via {action_type} failed. Recommend manual follow-up."
                txn.status = "ACTION_EXECUTED"
                txn.attempt_count += 1
        elif action_type == "SCHEDULE_REMINDER":
            action_status = "SCHEDULED"
            action_result = f"Automated customer SMS/WhatsApp payment reminder scheduled."
            txn.status = "PENDING_RECOVERY"
            txn.attempt_count += 1
        else:
            action_status = "SENT"
            action_result = f"Action {action_type} executed successfully."
            txn.status = "PENDING_RECOVERY"

        txn.updated_at = now

        # 4. Log recovery action
        recovery_log = RecoveryAction(
            transaction_id=txn.transaction_id,
            action_type=action_type,
            status=action_status,
            result=action_result,
            notes=notes,
            executed_at=now,
            created_at=now
        )

        db.add(recovery_log)
        db.commit()
        db.refresh(txn)
        db.refresh(recovery_log)

        return RecoveryActionResponse(
            id=recovery_log.id,
            transaction_id=recovery_log.transaction_id,
            action_type=recovery_log.action_type,
            status=recovery_log.status,
            result=recovery_log.result,
            notes=recovery_log.notes,
            executed_at=recovery_log.executed_at,
            updated_transaction=txn
        )

    @staticmethod
    def get_recovery_queue(db: Session) -> list:
        # Fetch unresolved failed transactions sorted by priority score descending
        unresolved = (
            db.query(Transaction)
            .filter(Transaction.status.in_(["FAILED", "PENDING_RECOVERY", "ACTION_EXECUTED"]))
            .order_by(Transaction.priority_score.desc(), Transaction.amount.desc())
            .all()
        )
        
        queue_items = []
        for txn in unresolved:
            eval_result = AIRecoveryEngine.evaluate_transaction(
                amount=txn.amount,
                failure_reason=txn.failure_reason,
                payment_method=txn.payment_method,
                attempt_count=txn.attempt_count,
                transaction_date=txn.transaction_date
            )
            queue_items.append({
                "transaction": txn,
                "scoring_detail": eval_result
            })

        return queue_items
