"""Generate YAML filenames matching the existing convention: {LastName}{YY}{slug}.yml"""

from __future__ import annotations

import re
import unicodedata


def generate_filename(title: str, authors: str, year: int | None) -> str:
    """Generate a filename like 'Davies24warmstarting-pushrelabel.yml'."""
    last_name = _first_author_last_name(authors)
    yy = str(year % 100).zfill(2) if year else "XX"
    slug = _title_slug(title)
    return f"{last_name}{yy}{slug}.yml"


def _first_author_last_name(authors: str) -> str:
    """Extract the last name of the first author."""
    first_author = authors.split(",")[0].strip()
    # Last name is the last word
    parts = first_author.split()
    if not parts:
        return "Unknown"
    last = parts[-1]
    # Remove accents for filename safety
    last = _strip_accents(last)
    # Capitalise first letter
    return last[0].upper() + last[1:] if last else "Unknown"


def _title_slug(title: str) -> str:
    """Create a short slug from the title (first 3-4 meaningful words)."""
    # Remove LaTeX-ish content
    t = re.sub(r"\$[^$]*\$", "", title)
    # Remove punctuation except hyphens
    t = re.sub(r"[^\w\s-]", "", t)
    words = t.lower().split()
    # Skip very short stop words
    stop = {"a", "an", "the", "of", "for", "and", "in", "on", "to", "with", "by", "via", "is", "are"}
    meaningful = [w for w in words if w not in stop]
    slug_words = meaningful[:3]
    return "-".join(slug_words) if slug_words else "paper"


def _strip_accents(s: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", s)
        if unicodedata.category(c) != "Mn"
    )
