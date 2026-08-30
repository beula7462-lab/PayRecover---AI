from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.db.session import get_db
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionResponse, PaginatedTransactions
from app.ai.recovery_engine import AIRecoveryEngine

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=PaginatedTransactions, summary="List & Filter Failed Transactions")
def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by status (FAILED, PENDING_RECOVERY, RECOVERED, ACTION_EXECUTED)"),
    payment_method: Optional[str] = Query(None, description="Filter by payment method"),
    failure_reason: Optional[str] = Query(None, description="Filter by failure reason"),
    search: Optional[str] = Query(None, description="Search customer name or transaction ID"),
    sort_by: str = Query("transaction_date", description="Field to sort by (transaction_date, amount, recovery_probability, priority_score)"),
    sort_dir: str = Query("desc", description="Sort direction (asc or desc)"),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)

    if status:
        query = query.filter(Transaction.status == status.upper())
    if payment_method:
        query = query.filter(Transaction.payment_method == payment_method)
    if failure_reason:
        query = query.filter(Transaction.failure_reason == failure_reason)
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Transaction.customer_name.ilike(search_pattern),
                Transaction.transaction_id.ilike(search_pattern)
            )
        )

    # Sorting
    sort_attr = getattr(Transaction, sort_by, Transaction.transaction_date)
    if sort_dir.lower() == "asc":
        query = query.order_by(asc(sort_attr))
    else:
        query = query.order_by(desc(sort_attr))

    total = query.count()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedTransactions(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/{id}", summary="Get Detailed Transaction & AI Recovery Analysis")
def get_transaction_by_id(id: str, db: Session = Depends(get_db)):
    # Support searching by string transaction_id (e.g. TXN1001) or primary key integer ID
    txn = None
    if id.isdigit():
        txn = db.query(Transaction).filter(Transaction.id == int(id)).first()
    if not txn:
        txn = db.query(Transaction).filter(Transaction.transaction_id == id).first()

    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction '{id}' not found."
        )

    # Calculate AI detail
    scoring_detail = AIRecoveryEngine.evaluate_transaction(
        amount=txn.amount,
        failure_reason=txn.failure_reason,
        payment_method=txn.payment_method,
        attempt_count=txn.attempt_count,
        transaction_date=txn.transaction_date
    )

    # Fetch history of recovery actions
    actions = [
        {
            "id": act.id,
            "action_type": act.action_type,
            "status": act.status,
            "result": act.result,
            "notes": act.notes,
            "executed_at": act.executed_at.isoformat() if act.executed_at else None
        }
        for act in sorted(txn.recovery_actions, key=lambda a: a.executed_at, reverse=True)
    ]

    return {
        "transaction": TransactionResponse.model_validate(txn),
        "ai_analysis": scoring_detail,
        "recovery_history": actions
    }
