"""Semantic Scholar API client."""

from __future__ import annotations

import logging

import requests

from alps_tool.api.cache import ApiCache
from alps_tool.api.rate_limiter import RateLimiter
from alps_tool.config import (
    CACHE_TTL_S2,
    S2_API_BASE,
    S2_API_KEY,
    S2_FIELDS_CITATIONS,
    S2_FIELDS_PAPER,
    S2_RATE_LIMIT,
)

log = logging.getLogger(__name__)


class SemanticScholarClient:
    """Client for the Semantic Scholar Academic Graph API."""

    def __init__(self, cache: ApiCache | None = None):
        self._cache = cache or ApiCache(enabled=False)
        self._limiter = RateLimiter(S2_RATE_LIMIT)
        self._session = requests.Session()
        if S2_API_KEY:
            self._session.headers["x-api-key"] = S2_API_KEY

    def get_paper(self, paper_id: str) -> dict | None:
        """Fetch a single paper by S2 ID, arxiv:{id}, or DBLP:{key}.

        Returns the paper dict or None if not found.
        """
        cache_key = f"s2:paper:{paper_id}"
        cached = self._cache.get(cache_key, CACHE_TTL_S2)
        if cached is not None:
            return cached

        url = f"{S2_API_BASE}/paper/{paper_id}"
        params = {"fields": S2_FIELDS_PAPER}
        data = self._request(url, params)
        if data:
            self._cache.set(cache_key, data)
        return data

    def search(self, query: str, limit: int = 5) -> list[dict]:
        """Search papers by title query."""
        cache_key = f"s2:search:{query}:{limit}"
        cached = self._cache.get(cache_key, CACHE_TTL_S2)
        if cached is not None:
            return cached

        url = f"{S2_API_BASE}/paper/search"
        params = {"query": query, "limit": limit, "fields": S2_FIELDS_PAPER}
        data = self._request(url, params)
        results = data.get("data", []) if data else []
        self._cache.set(cache_key, results)
        return results

    def get_citations(self, paper_id: str, limit: int = 1000) -> list[dict]:
        """Get papers that cite the given paper.

        Returns list of citing paper dicts. Paginates automatically.
        """
        cache_key = f"s2:citations:{paper_id}:{limit}"
        cached = self._cache.get(cache_key, CACHE_TTL_S2)
        if cached is not None:
            return cached

        all_citations: list[dict] = []
        offset = 0
        page_size = min(limit, 500)

        while offset < limit:
            url = f"{S2_API_BASE}/paper/{paper_id}/citations"
            params = {
                "fields": S2_FIELDS_CITATIONS,
                "offset": offset,
                "limit": page_size,
            }
            data = self._request(url, params)
            if not data:
                break
            batch = data.get("data", [])
            if not batch:
                break
            # Each citation entry has a "citingPaper" sub-dict
            for item in batch:
                citing = item.get("citingPaper")
                if citing and citing.get("paperId"):
                    all_citations.append(citing)
            offset += len(batch)
            if len(batch) < page_size:
                break

        self._cache.set(cache_key, all_citations)
        return all_citations[:limit]

    def _request(self, url: str, params: dict, _retries: int = 3) -> dict | None:
        """Make a rate-limited GET request with exponential backoff on 429."""
        for attempt in range(_retries):
            self._limiter.wait()
            try:
                resp = self._session.get(url, params=params, timeout=30)
                if resp.status_code == 404:
                    self._limiter.reset_backoff()
                    return None
                if resp.status_code == 429:
                    self._limiter.backoff()
                    log.warning(
                        "S2 rate limit (429), backoff attempt %d/%d",
                        attempt + 1, _retries,
                    )
                    continue
                resp.raise_for_status()
                self._limiter.reset_backoff()
                return resp.json()
            except requests.RequestException as e:
                log.warning("S2 API error: %s", e)
                return None
        log.warning("S2 request failed after %d retries: %s", _retries, url)
        return None
