from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.recovery import RecoveryActionRequest, RecoveryActionResponse, AIQueueItemResponse
from app.services.recovery_service import RecoveryService

router = APIRouter(tags=["Recovery Queue & Actions"])

@router.get("/recovery-queue", response_model=List[AIQueueItemResponse], summary="Get Prioritized AI Recovery Queue")
def get_recovery_queue(db: Session = Depends(get_db)):
    return RecoveryService.get_recovery_queue(db)

@router.post("/transactions/{id}/recover", response_model=RecoveryActionResponse, summary="Execute Recovery Action on Failed Transaction")
def execute_recovery(
    id: str,
    request: RecoveryActionRequest,
    db: Session = Depends(get_db)
):
    return RecoveryService.execute_recovery_action(db, transaction_id=id, request=request)
