from __future__ import annotations

from typing import Optional

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

# Import config as a simple module; app.py ensures the backend directory is
# on sys.path so that `import config` resolves to backend/config.py.
import config  # type: ignore

_client: Optional[MongoClient] = None


def get_client() -> MongoClient:
    """
    Lazily create and return a global MongoClient.
    """
    global _client
    if _client is None:
        _client = MongoClient(config.MONGODB_URI)
    return _client


def get_db() -> Database:
    client = get_client()
    return client[config.MONGODB_DB_NAME]


def get_collection(name: str) -> Collection:
    db = get_db()
    return db[name]
