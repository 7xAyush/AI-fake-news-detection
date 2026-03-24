"""
Backend configuration for the Fake News Detection system.

Holds MongoDB and JWT-related settings. Override via environment variables
for production/deployment.
"""

import os

# MongoDB connection URI. Override via MONGODB_URI in your environment.
MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

# Database name for this project.
MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "fake_news_db")

# Secret key used to sign JWT tokens. In production, always override.
JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")

# Access token lifetime (minutes).
JWT_ACCESS_TOKEN_EXPIRES_MINUTES: int = int(
    os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "60")
)
