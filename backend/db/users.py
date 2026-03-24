"""
User-related database helpers.
"""

from datetime import datetime
from typing import Optional

from bson import ObjectId
from pymongo.collection import Collection

from .mongo import get_collection


def _users_collection() -> Collection:
  return get_collection("users")


def get_user_by_email(email: str) -> Optional[dict]:
    return _users_collection().find_one({"email": email.lower()})


def get_user_by_id(user_id: str) -> Optional[dict]:
    try:
        oid = ObjectId(user_id)
    except Exception:
        return None
    return _users_collection().find_one({"_id": oid})


def create_user(name: str, email: str, password_hash: str) -> dict:
    col = _users_collection()
    # Make the first user an admin to ensure there is at least one admin
    # without requiring manual DB changes.
    is_first_user = col.count_documents({}) == 0

    doc = {
        "name": name,
        "email": email.lower(),
        "password_hash": password_hash,
        "created_at": datetime.utcnow(),
        "is_admin": is_first_user,
    }
    result = col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc
