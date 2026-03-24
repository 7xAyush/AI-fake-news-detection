from __future__ import annotations

from typing import Dict, Optional

from langdetect import DetectorFactory, detect_langs
from sumy.nlp.tokenizers import Tokenizer
from sumy.parsers.plaintext import PlaintextParser
from sumy.summarizers.lsa import LsaSummarizer


# Make language detection deterministic.
DetectorFactory.seed = 42


def detect_language(text: str) -> Dict[str, Optional[float]]:
    """
    Detect the primary language of the given text using langdetect.

    Returns a small dict with ISO code and confidence score.
    """
    cleaned = (text or "").strip()
    if not cleaned:
        return {"code": None, "confidence": None}

    try:
        langs = detect_langs(cleaned)
    except Exception:
        return {"code": None, "confidence": None}

    if not langs:
        return {"code": None, "confidence": None}

    best = langs[0]
    return {"code": best.lang, "confidence": float(best.prob)}


def summarize_text(text: str, max_sentences: int = 3) -> Optional[str]:
    """
    Generate a short extractive summary using Sumy's LSA summarizer.
    """
    cleaned = (text or "").strip()
    if len(cleaned.split()) < 40:
        # Text is too short to summarize meaningfully.
        return None

    try:
        parser = PlaintextParser.from_string(cleaned, Tokenizer("english"))
        summarizer = LsaSummarizer()
        sentences = summarizer(parser.document, max_sentences)
        summary = " ".join(str(s) for s in sentences).strip()
        return summary or None
    except Exception:
        return None

