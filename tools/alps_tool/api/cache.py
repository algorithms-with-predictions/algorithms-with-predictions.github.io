"""SQLite disk cache for API responses."""

from __future__ import annotations

import json
import sqlite3
import time
from pathlib import Path

from alps_tool.config import CACHE_DIR


class ApiCache:
    """Simple SQLite-backed cache with TTL support."""

    def __init__(self, db_path: Path | None = None, enabled: bool = True):
        self.enabled = enabled
        if not enabled:
            self._conn = None
            return
        db_path = db_path or (CACHE_DIR / "api_cache.db")
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(str(db_path))
        self._conn.execute(
            """CREATE TABLE IF NOT EXISTS cache (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                created_at REAL NOT NULL
            )"""
        )
        self._conn.commit()

    def get(self, key: str, ttl: int) -> dict | list | None:
        """Get a cached value if it exists and hasn't expired."""
        if not self.enabled or not self._conn:
            return None
        row = self._conn.execute(
            "SELECT value, created_at FROM cache WHERE key = ?", (key,)
        ).fetchone()
        if row is None:
            return None
        value_str, created_at = row
        if time.time() - created_at > ttl:
            self._conn.execute("DELETE FROM cache WHERE key = ?", (key,))
            self._conn.commit()
            return None
        return json.loads(value_str)

    def set(self, key: str, value: dict | list) -> None:
        """Store a value in the cache."""
        if not self.enabled or not self._conn:
            return
        self._conn.execute(
            "INSERT OR REPLACE INTO cache (key, value, created_at) VALUES (?, ?, ?)",
            (key, json.dumps(value), time.time()),
        )
        self._conn.commit()

    def clear(self) -> int:
        """Clear all cached entries. Returns count of deleted rows."""
        if not self._conn:
            return 0
        cursor = self._conn.execute("DELETE FROM cache")
        self._conn.commit()
        return cursor.rowcount

    def close(self) -> None:
        if self._conn:
            self._conn.close()
