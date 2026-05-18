"""Fuzzy title matching using rapidfuzz."""

from __future__ import annotations

import re

from rapidfuzz import fuzz

from alps_tool.config import FUZZY_MATCH_THRESHOLD


def normalise_title(title: str) -> str:
    """Lowercase, strip punctuation, collapse whitespace."""
    t = title.lower().strip()
    t = re.sub(r"[^\w\s]", "", t)
    t = re.sub(r"\s+", " ", t)
    return t


def titles_match(a: str, b: str, threshold: int = FUZZY_MATCH_THRESHOLD) -> bool:
    """Check if two titles match above the fuzzy threshold."""
    na, nb = normalise_title(a), normalise_title(b)
    if na == nb:
        return True
    return fuzz.ratio(na, nb) >= threshold


def best_title_match(
    query: str, candidates: dict[str, object], threshold: int = FUZZY_MATCH_THRESHOLD
) -> tuple[str, float] | None:
    """Find the best matching title from a dict keyed by normalised titles.

    Returns (matched_key, score) or None if no match above threshold.
    """
    nq = normalise_title(query)
    best_key = None
    best_score = 0.0
    for key in candidates:
        score = fuzz.ratio(nq, key)
        if score > best_score:
            best_score = score
            best_key = key
    if best_key and best_score >= threshold:
        return best_key, best_score
    return None


def normalise_venue(name: str) -> str:
    """Normalise a venue name for comparison."""
    from alps_tool.config import VENUE_ALIASES
    # Check alias map first
    if name in VENUE_ALIASES:
        return VENUE_ALIASES[name]
    # Strip common prefixes/suffixes and normalise
    n = name.strip()
    return n
