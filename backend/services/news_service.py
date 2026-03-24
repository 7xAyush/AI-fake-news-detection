from __future__ import annotations

from datetime import datetime
from typing import Dict, List

import os

import requests


def get_trending_news() -> List[Dict[str, str]]:
    """
    Fetch a list of trending news articles from an external API.

    To keep this project self-contained, we only call NewsAPI.org if an
    API key is provided via the NEWS_API_KEY environment variable.
    Otherwise we return a small static list of example headlines.
    """
    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        # Static fallback; suitable for offline demos.
        return [
            {
                "title": "Sample: Central bank reviews economic outlook for 2026",
                "url": "https://example.com/economy-2026",
                "source": "Example News",
                "published_at": datetime.utcnow().isoformat(),
            },
            {
                "title": "Sample: Researchers explore new AI techniques for misinformation detection",
                "url": "https://example.com/ai-fake-news",
                "source": "Tech Example",
                "published_at": datetime.utcnow().isoformat(),
            },
        ]

    try:
        resp = requests.get(
            "https://newsapi.org/v2/top-headlines",
            params={"country": "us", "pageSize": 10, "apiKey": api_key},
            timeout=8,
        )
        resp.raise_for_status()
        payload = resp.json()
        articles = payload.get("articles", [])
        items: List[Dict[str, str]] = []
        for art in articles:
            items.append(
                {
                    "title": art.get("title") or "",
                    "url": art.get("url") or "",
                    "source": (art.get("source") or {}).get("name") or "",
                    "published_at": art.get("publishedAt") or "",
                }
            )
        return items
    except Exception:
        # On error, fall back to static data.
        return [
            {
                "title": "Unable to fetch live news; showing static examples.",
                "url": "https://newsapi.org/",
                "source": "NewsAPI",
                "published_at": datetime.utcnow().isoformat(),
            }
        ]

