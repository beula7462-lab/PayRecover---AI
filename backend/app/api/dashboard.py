from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.dashboard import DashboardMetricsResponse, DashboardInsightsResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/metrics", response_model=DashboardMetricsResponse, summary="Get Core Revenue Recovery Dashboard Metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    return DashboardService.get_metrics(db)

@router.get("/insights", response_model=DashboardInsightsResponse, summary="Get Dynamic DB-Driven AI Operational Insights")
def get_dashboard_insights(db: Session = Depends(get_db)):
    return DashboardService.get_insights(db)
