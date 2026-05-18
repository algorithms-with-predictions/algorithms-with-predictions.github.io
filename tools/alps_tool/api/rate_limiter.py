"""Time-tracking rate limiter for API requests."""

from __future__ import annotations

import time


class RateLimiter:
    """Enforces a minimum interval between requests with backoff support."""

    def __init__(self, requests_per_second: float):
        self._min_interval = 1.0 / requests_per_second if requests_per_second > 0 else 0
        self._last_request = 0.0
        self._backoff = 0.0  # extra delay after rate-limit hits

    def wait(self) -> None:
        """Block until it's safe to make the next request."""
        if self._min_interval <= 0:
            return
        now = time.time()
        interval = self._min_interval + self._backoff
        elapsed = now - self._last_request
        if elapsed < interval:
            time.sleep(interval - elapsed)
        self._last_request = time.time()

    def backoff(self) -> None:
        """Increase delay after a rate-limit (429) response."""
        if self._backoff == 0:
            self._backoff = 2.0
        else:
            self._backoff = min(self._backoff * 2, 60.0)

    def reset_backoff(self) -> None:
        """Reset backoff after a successful request."""
        self._backoff = 0.0
