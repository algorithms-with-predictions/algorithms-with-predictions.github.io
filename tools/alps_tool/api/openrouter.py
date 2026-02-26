"""Minimal OpenRouter chat-completion client using requests."""

from __future__ import annotations

import logging

import requests

from alps_tool.config import OPENROUTER_API_BASE, OPENROUTER_API_KEY, OPENROUTER_MODEL

log = logging.getLogger(__name__)


class OpenRouterClient:
    """Send chat completions via the OpenRouter API."""

    def __init__(self, model: str | None = None):
        if not OPENROUTER_API_KEY:
            raise RuntimeError(
                "OPENROUTER_API_KEY environment variable is not set. "
                "Get a key at https://openrouter.ai/keys"
            )
        self._model = model or OPENROUTER_MODEL
        self._session = requests.Session()
        self._session.headers.update({
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        })

    def complete(self, system: str, user: str) -> str:
        """Send a chat completion request and return the assistant content."""
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        }
        resp = self._session.post(OPENROUTER_API_BASE, json=payload, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        choices = data.get("choices", [])
        if not choices:
            raise RuntimeError(f"OpenRouter returned no choices: {data}")
        return choices[0]["message"]["content"].strip()
