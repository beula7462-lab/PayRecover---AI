import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger("payrecover.db")

db_url = settings.DATABASE_URL

# Fix dialect if needed (e.g. postgres -> postgresql)
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

try:
    if db_url.startswith("sqlite"):
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
    else:
        # PostgreSQL engine
        test_engine = create_engine(db_url, pool_pre_ping=True, connect_args={"connect_timeout": 3})
        # Test connection
        with test_engine.connect() as conn:
            pass
        engine = test_engine
except Exception as e:
    logger.warning(f"Could not connect to configured DATABASE_URL ({db_url}): {e}. Falling back to local SQLite database.")
    db_url = "sqlite:///./payrecover.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
