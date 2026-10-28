import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=True)

    PROJECT_NAME: str = "College Club Recommendation System"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-2026-xyz-recommendation")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./college_clubs.db")
    
    # Recommendation Engine Weights
    TFIDF_WEIGHT: float = float(os.getenv("TFIDF_WEIGHT", 0.50))
    OVERLAP_WEIGHT: float = float(os.getenv("OVERLAP_WEIGHT", 0.35))
    GRAPH_WEIGHT: float = float(os.getenv("GRAPH_WEIGHT", 0.15))
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
