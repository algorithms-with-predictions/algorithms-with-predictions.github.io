"""Custom YAML serialization matching the existing ALPS paper file style."""

from __future__ import annotations

from alps_tool.config import YAML_FIELD_ORDER, PUBLICATION_FIELD_ORDER
from alps_tool.models import Paper, Publication


def paper_to_yaml(paper: Paper) -> str:
    """Serialize a Paper to YAML matching existing file conventions."""
    lines: list[str] = []

    data = _paper_to_dict(paper)

    for key in YAML_FIELD_ORDER:
        if key not in data or data[key] is None:
            continue
        value = data[key]

        if key == "labels":
            lines.append("labels:")
            for label in value:
                lines.append(f"- {label}")
        elif key == "publications":
            lines.append("publications:")
            for pub in value:
                lines.extend(_format_publication(pub))
        elif key == "abstract":
            lines.append(_format_block_string("abstract", value))
        else:
            lines.append(_format_scalar(key, value))

    return "\n".join(lines) + "\n"


def publication_to_yaml_fragment(pub: Publication) -> str:
    """Serialize a single Publication for appending to an existing file."""
    return "\n".join(_format_publication(_pub_to_dict(pub)))


def _paper_to_dict(paper: Paper) -> dict:
    d: dict = {}
    if paper.title:
        d["title"] = paper.title
    if paper.authors:
        d["authors"] = paper.authors
    if paper.abstract:
        d["abstract"] = paper.abstract
    if paper.labels:
        d["labels"] = paper.labels
    if paper.publications:
        d["publications"] = [_pub_to_dict(p) for p in paper.publications]
    if paper.year is not None:
        d["year"] = paper.year
    if paper.arxiv:
        d["arxiv"] = paper.arxiv
    if paper.s2_id:
        d["s2_id"] = paper.s2_id
    return d


def _pub_to_dict(pub: Publication) -> dict:
    d: dict = {}
    if pub.name:
        d["name"] = pub.name
    if pub.url:
        d["url"] = pub.url
    if pub.year is not None:
        d["year"] = pub.year
    if pub.month is not None:
        d["month"] = pub.month
    if pub.day is not None:
        d["day"] = pub.day
    if pub.dblp_key:
        d["dblp_key"] = pub.dblp_key
    if pub.bibtex:
        d["bibtex"] = pub.bibtex
    return d


def _format_publication(pub_dict: dict) -> list[str]:
    """Format a publication dict as YAML list item lines."""
    lines: list[str] = []
    first = True
    for key in PUBLICATION_FIELD_ORDER:
        if key not in pub_dict or pub_dict[key] is None:
            continue
        value = pub_dict[key]
        prefix = "- " if first else "  "
        first = False
        if key == "bibtex":
            # Use quoted scalar for bibtex (matches existing convention)
            escaped = value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
            lines.append(f'{prefix}bibtex: "{escaped}"')
        else:
            lines.append(f"{prefix}{_format_scalar(key, value)}")
    return lines


def _format_scalar(key: str, value) -> str:
    """Format a single key: value pair."""
    if isinstance(value, bool):
        return f"{key}: {'true' if value else 'false'}"
    if isinstance(value, int):
        return f"{key}: {value}"
    if isinstance(value, str):
        # Use quotes if the string contains special chars
        if _needs_quoting(value):
            escaped = value.replace("\\", "\\\\").replace('"', '\\"')
            return f'{key}: "{escaped}"'
        return f"{key}: {value}"
    return f"{key}: {value}"


def _format_block_string(key: str, value: str) -> str:
    """Format a long string as a YAML flow scalar (matching existing style)."""
    # Existing files use flow scalars for abstracts, not block scalars
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'{key}: "{escaped}"'


def _needs_quoting(s: str) -> bool:
    """Check if a YAML string value needs quoting."""
    if not s:
        return True
    # Quote if starts with special chars
    if s[0] in "{}[]&*!|>'\"%@`#,?:-":
        return True
    # Quote if contains colon-space or hash-space
    if ": " in s or " #" in s:
        return True
    # Quote if contains newlines
    if "\n" in s:
        return True
    return False
