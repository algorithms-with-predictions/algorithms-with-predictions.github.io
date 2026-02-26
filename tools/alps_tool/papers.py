"""Load and write YAML paper files, build lookup indices."""

from __future__ import annotations

import glob as globmod
from pathlib import Path

import yaml

from alps_tool.config import PAPERS_DIR
from alps_tool.models import Paper, Publication


def _parse_publication(data: dict) -> Publication:
    return Publication(
        name=data.get("name", ""),
        url=data.get("url"),
        year=data.get("year"),
        month=data.get("month"),
        day=data.get("day"),
        dblp_key=data.get("dblp_key"),
        bibtex=data.get("bibtex"),
    )


def _parse_paper(data: dict, filename: str) -> Paper:
    pubs_raw = data.get("publications") or []
    publications = [_parse_publication(p) for p in pubs_raw]

    return Paper(
        title=data.get("title", ""),
        authors=data.get("authors", ""),
        labels=data.get("labels") or [],
        publications=publications,
        abstract=data.get("abstract"),
        year=data.get("year"),
        arxiv=str(data["arxiv"]) if data.get("arxiv") is not None else None,
        s2_id=data.get("s2_id"),
        filename=filename,
    )


def load_papers(papers_dir: Path | None = None) -> list[Paper]:
    """Load all paper YAML files and return Paper objects."""
    papers_dir = papers_dir or PAPERS_DIR
    papers: list[Paper] = []
    for path in sorted(papers_dir.iterdir()):
        if path.suffix not in (".yml", ".yaml"):
            continue
        with open(path, encoding="utf-8") as f:
            data = yaml.safe_load(f)
        if not isinstance(data, dict):
            continue
        papers.append(_parse_paper(data, path.name))
    return papers


def build_title_index(papers: list[Paper]) -> dict[str, Paper]:
    """Map normalised title → Paper for deduplication."""
    return {_normalise_title(p.title): p for p in papers}


def build_s2_index(papers: list[Paper]) -> dict[str, Paper]:
    """Map s2_id → Paper."""
    return {p.s2_id: p for p in papers if p.s2_id}


def build_arxiv_index(papers: list[Paper]) -> dict[str, Paper]:
    """Map arxiv id → Paper."""
    return {p.arxiv: p for p in papers if p.arxiv}


def _normalise_title(title: str) -> str:
    """Lowercase, strip punctuation, collapse whitespace."""
    import re
    t = title.lower().strip()
    t = re.sub(r"[^\w\s]", "", t)
    t = re.sub(r"\s+", " ", t)
    return t


def find_paper_path(filename: str, papers_dir: Path | None = None) -> Path | None:
    """Find the full path for a paper by filename or glob pattern."""
    papers_dir = papers_dir or PAPERS_DIR
    matches = globmod.glob(str(papers_dir / filename))
    if matches:
        return Path(matches[0])
    # Try with extension
    for ext in (".yml", ".yaml"):
        matches = globmod.glob(str(papers_dir / (filename + ext)))
        if matches:
            return Path(matches[0])
    return None
