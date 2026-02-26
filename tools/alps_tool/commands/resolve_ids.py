"""Fill missing s2_id/arxiv on existing papers."""

from __future__ import annotations

from pathlib import Path

import yaml
from rich.console import Console
from rich.table import Table

from alps_tool.api.cache import ApiCache
from alps_tool.api.semantic_scholar import SemanticScholarClient
from alps_tool.config import PAPERS_DIR
from alps_tool.models import Paper
from alps_tool.papers import load_papers
from alps_tool.resolve import resolve_batch, ResolveResult

console = Console()


def run_resolve(
    *,
    write: bool = False,
    verbose: bool = False,
    cache: ApiCache | None = None,
) -> list[ResolveResult]:
    """Resolve missing Semantic Scholar IDs for all papers."""
    papers = load_papers()
    console.print(f"Loaded {len(papers)} papers")

    already = sum(1 for p in papers if p.s2_id)
    console.print(f"  Already have s2_id: {already}")
    console.print(f"  Missing s2_id: {len(papers) - already}")

    s2 = SemanticScholarClient(cache=cache)
    results = resolve_batch(papers, s2, verbose=verbose)

    # Report
    strategies: dict[str, int] = {}
    for r in results:
        strategies[r.strategy] = strategies.get(r.strategy, 0) + 1

    table = Table(title="Resolution Results")
    table.add_column("Strategy", width=15)
    table.add_column("Count", justify="right", width=8)
    for strat, count in sorted(strategies.items()):
        table.add_row(strat, str(count))
    console.print(table)

    # Show newly resolved
    newly_resolved = [r for r in results if r.strategy not in ("cached", "failed")]
    if newly_resolved:
        detail = Table(title=f"Newly Resolved ({len(newly_resolved)})")
        detail.add_column("Paper", max_width=50)
        detail.add_column("Strategy", width=15)
        detail.add_column("S2 ID", max_width=44)
        for r in newly_resolved:
            detail.add_row(r.paper.title[:50], r.strategy, r.s2_id or "")
        console.print(detail)

    if write and newly_resolved:
        _write_s2_ids(newly_resolved)

    return results


def _write_s2_ids(results: list[ResolveResult]) -> None:
    """Write resolved s2_ids back to YAML files."""
    count = 0
    for r in results:
        if not r.s2_id or not r.paper.filename:
            continue
        path = PAPERS_DIR / r.paper.filename
        if not path.exists():
            continue

        text = path.read_text(encoding="utf-8")
        if "s2_id:" in text:
            continue  # already has one, skip

        # Append s2_id at the end
        if not text.endswith("\n"):
            text += "\n"
        text += f"s2_id: {r.s2_id}\n"
        path.write_text(text, encoding="utf-8")
        count += 1
        console.print(f"  [green]Wrote s2_id to {r.paper.filename}[/green]")

    console.print(f"[green]Updated {count} files[/green]")
