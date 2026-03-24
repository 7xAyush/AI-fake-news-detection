from __future__ import annotations

from typing import Dict, Optional
from urllib.parse import urlparse


TRUSTED_DOMAINS_HIGH = {
    "bbc.co.uk",
    "bbc.com",
    "nytimes.com",
    "reuters.com",
    "apnews.com",
    "theguardian.com",
    "indiatoday.in",
    "indianexpress.com",
}

TRUSTED_DOMAINS_LOW = {
    "clickbait.example.com",
    "fake-news.example.com",
}


def extract_domain(url: str) -> Optional[str]:
    """
    Extract the hostname/domain from a URL.
    """
    try:
        parsed = urlparse(url)
        host = parsed.netloc.lower()
        # Strip common "www." prefix.
        if host.startswith("www."):
            host = host[4:]
        return host or None
    except Exception:
        return None


def score_domain(domain: str) -> Dict[str, object]:
    """
    Basic credibility scoring for a domain.

    This is intentionally simple and rule-based for demo purposes.
    """
    if domain in TRUSTED_DOMAINS_HIGH:
        return {
            "domain": domain,
            "credibility_score": 0.9,
            "label": "high",
            "reason": "Domain is in a hard-coded list of major news outlets.",
        }
    if domain in TRUSTED_DOMAINS_LOW:
        return {
            "domain": domain,
            "credibility_score": 0.2,
            "label": "low",
            "reason": "Domain is in a hard-coded low-credibility list.",
        }
    # Default medium score.
    return {
        "domain": domain,
        "credibility_score": 0.5,
        "label": "medium",
        "reason": "No specific information; defaulting to medium credibility.",
    }


def get_source_info(url: str) -> Optional[Dict[str, object]]:
    """
    Extract a basic credibility profile for the given URL.
    """
    domain = extract_domain(url)
    if not domain:
        return None
    return score_domain(domain)

