"""
Schema helpers for MongoDB documents.

We keep things simple and just build plain Python dicts to represent
documents; no heavy ODM is needed for this project.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional


def build_analysis_document(
    *,
    user_id: Optional[str],
    input_type: str,
    original_text_snippet: str,
    url: Optional[str],
    filename: Optional[str],
    prediction: str,
    confidence: float,
    suspicious_words: List[str],
) -> Dict[str, Any]:
    """
    Construct a document representing a single prediction/analysis.
    """
    return {
        "user_id": user_id,  # wired after auth step
        "input_type": input_type,  # "text" | "url" | "file"
        "original_text_snippet": original_text_snippet,
        "url": url,
        "filename": filename,
        "prediction": prediction,
        "confidence": confidence,
        "suspicious_words": suspicious_words,
        "bookmarked": False,
        "user_feedback": None,  # True (correct), False (incorrect) or None
        "created_at": datetime.utcnow(),
    }
