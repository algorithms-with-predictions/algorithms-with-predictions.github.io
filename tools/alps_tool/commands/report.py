"""Terminal (rich tables), JSON, and markdown output for reports."""

from __future__ import annotations

import json
from pathlib import Path

from rich.console import Console
from rich.table import Table

from alps_tool.config import REPORTS_DIR
from alps_tool.models import Candidate, NewPublication


console = Console()


def print_candidates(candidates: list[Candidate], limit: int | None = None) -> None:
    """Print discovery candidates as a rich table."""
    if not candidates:
        console.print("[yellow]No candidates found.[/yellow]")
        return

    shown = candidates[:limit] if limit else candidates
    table = Table(title=f"Candidate Papers ({len(shown)} of {len(candidates)})")
    table.add_column("#", style="dim", width=4)
    table.add_column("Score", justify="right", width=5)
    table.add_column("Title", max_width=60)
    table.add_column("Authors", max_width=30)
    table.add_column("Year", width=5)
    table.add_column("Cites ALPS Papers", max_width=40)

    for i, c in enumerate(shown, 1):
        cited = ", ".join(c.cited_alps_papers[:3])
        if len(c.cited_alps_papers) > 3:
            cited += f" +{len(c.cited_alps_papers) - 3}"
        table.add_row(
            str(i),
            str(c.score),
            c.title[:60],
            c.authors[:30],
            str(c.year or ""),
            cited,
        )

    console.print(table)


def print_new_publications(new_pubs: list[NewPublication]) -> None:
    """Print newly found publications as a rich table."""
    if not new_pubs:
        console.print("[yellow]No new publications found.[/yellow]")
        return

    table = Table(title=f"New Publications Found ({len(new_pubs)})")
    table.add_column("Paper", max_width=50)
    table.add_column("New Venue", width=20)
    table.add_column("Year", width=5)
    table.add_column("Source", width=8)

    for np in new_pubs:
        table.add_row(
            np.paper.title[:50],
            np.publication.name,
            str(np.publication.year or ""),
            np.source,
        )

    console.print(table)


def save_candidates_json(candidates: list[Candidate], filename: str = "candidates.json") -> Path:
    """Save candidates to a JSON file in reports/."""
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    path = REPORTS_DIR / filename
    data = [
        {
            "title": c.title,
            "authors": c.authors,
            "year": c.year,
            "s2_id": c.s2_id,
            "arxiv": c.arxiv,
            "url": c.url,
            "score": c.score,
            "cited_alps_papers": c.cited_alps_papers,
            "suggested_labels": c.suggested_labels,
        }
        for c in candidates
    ]
    path.write_text(json.dumps(data, indent=2))
    console.print(f"[green]Saved {len(candidates)} candidates to {path}[/green]")
    return path


def save_candidates_markdown(candidates: list[Candidate], filename: str = "candidates.md") -> Path:
    """Save candidates as a markdown report."""
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    path = REPORTS_DIR / filename
    lines = [f"# ALPS Discovery Report\n\n{len(candidates)} candidates found.\n"]
    for i, c in enumerate(candidates, 1):
        lines.append(f"## {i}. {c.title}")
        lines.append(f"- **Authors**: {c.authors}")
        lines.append(f"- **Year**: {c.year or 'N/A'}")
        lines.append(f"- **Score**: cites {c.score} ALPS papers")
        if c.cited_alps_papers:
            lines.append(f"- **Cites**: {', '.join(c.cited_alps_papers[:5])}")
        if c.suggested_labels:
            lines.append(f"- **Suggested labels**: {', '.join(c.suggested_labels)}")
        lines.append("")
    path.write_text("\n".join(lines))
    console.print(f"[green]Saved markdown report to {path}[/green]")
    return path
