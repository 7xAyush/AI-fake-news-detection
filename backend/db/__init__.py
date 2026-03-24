"""
Database package for MongoDB integration.

Exposes helper functions to get the active database and collections.
"""

from .mongo import get_db, get_collection  # noqa: F401

