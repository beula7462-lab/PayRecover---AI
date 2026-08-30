from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.__init__ import api_router
from app.api.health import router as health_router
from app.db.base import Base
from app.db.session import engine

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    ## PayRecover AI — Enterprise AI Revenue Recovery Platform Backend
    
    PayRecover AI monitors digital payment failures, evaluates recovery probabilities using explainable AI models,
    prioritizes recovery queues, and executes automated recovery actions.
    
    *Note: Uses synthetic payment data for demonstration. No real financial transactions are executed.*
    """,
    openapi_tags=[
        {"name": "Health", "description": "System health and deployment diagnostic endpoints"},
        {"name": "Dashboard", "description": "KPI metrics and dynamic AI insights"},
        {"name": "Transactions", "description": "Failed transaction management, filtering, and deep analysis"},
        {"name": "Recovery Queue & Actions", "description": "AI-prioritized recovery queue and action execution"},
        {"name": "Analytics", "description": "Historical recovery trends, failure causes, and channel metrics"},
    ]
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount health router at top level (for Railway / Docker healthchecks)
app.include_router(health_router)

# Mount main API router under /api
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
