"""Dataclasses for papers, publications, and discovery results."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Publication:
    name: str
    url: str | None = None
    year: int | None = None
    month: int | None = None
    day: int | None = None
    dblp_key: str | None = None
    bibtex: str | None = None


@dataclass
class Paper:
    title: str
    authors: str
    labels: list[str] = field(default_factory=list)
    publications: list[Publication] = field(default_factory=list)
    abstract: str | None = None
    year: int | None = None
    arxiv: str | None = None
    s2_id: str | None = None
    # Runtime metadata (not serialised to YAML)
    filename: str | None = None

    @property
    def venue_names(self) -> set[str]:
        return {p.name for p in self.publications}


@dataclass
class Candidate:
    """A paper discovered via citation analysis that might belong in ALPS."""
    title: str
    authors: str
    year: int | None
    s2_id: str | None
    arxiv: str | None
    url: str | None
    cited_alps_papers: list[str] = field(default_factory=list)
    score: int = 0  # number of ALPS papers it cites
    suggested_labels: list[str] = field(default_factory=list)


@dataclass
class NewPublication:
    """A newly found publication venue for an existing paper."""
    paper: Paper
    publication: Publication
    source: str  # "s2" or "dblp"
    matched_title: str | None = None  # title as it appears in the source DB
