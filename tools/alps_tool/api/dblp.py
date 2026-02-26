"""DBLP client backed by local SQLite index of dblp.xml.gz dump."""

from __future__ import annotations

import logging

from alps_tool import dblp_local

log = logging.getLogger(__name__)


class DblpClient:
    """Drop-in replacement for the old API-based DBLP client.

    Uses a local SQLite + FTS5 index built from the DBLP XML dump.
    The ``cache`` parameter is accepted for interface compatibility but unused
    (the local DB *is* the cache).
    """

    def __init__(self, cache=None):  # noqa: ARG002
        pass

    def search_publications(self, query: str, max_results: int = 10) -> list[dict]:
        """Search local DBLP index for publications matching a title query."""
        return dblp_local.search_publications(query, max_results=max_results)

    def get_bibtex(self, dblp_key: str) -> str | None:
        """Generate BibTeX for a DBLP record by key."""
        return dblp_local.get_bibtex(dblp_key)
