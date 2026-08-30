from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.dashboard import router as dashboard_router
from app.api.transactions import router as transactions_router
from app.api.recovery import router as recovery_router
from app.api.analytics import router as analytics_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(dashboard_router)
api_router.include_router(transactions_router)
api_router.include_router(recovery_router)
api_router.include_router(analytics_router)

__all__ = ["api_router"]
