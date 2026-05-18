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
from alps_tool.resolve import resolve_s2_id, ResolveResult

console = Console()


def run_resolve(
    *,
    write: bool = False,
    verbose: bool = False,
    cache: ApiCache | None = None,
) -> list[ResolveResult]:
    """Resolve missing Semantic Scholar IDs for all papers."""
    from rich.progress import Progress, SpinnerColumn, TextColumn

    papers = load_papers()
    console.print(f"Loaded {len(papers)} papers")

    resolved = [p for p in papers if p.s2_id and p.s2_id != "none"]
    marked_none = [p for p in papers if p.s2_id == "none"]
    to_check = [p for p in papers if not p.s2_id]
    console.print(f"  Already have s2_id: {len(resolved)}")
    console.print(f"  Marked as not found: {len(marked_none)}")
    console.print(f"  To check: {len(to_check)}")

    s2 = SemanticScholarClient(cache=cache)

    results: list[ResolveResult] = []
    write_count = 0
    fail_count = 0

    # Add cached results for already-resolved papers
    for p in resolved:
        results.append(ResolveResult(p, p.s2_id, "cached"))

    if not to_check:
        console.print("  Nothing to resolve")
    else:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            transient=True,
        ) as progress:
            task = progress.add_task("Resolving S2 IDs...", total=len(to_check))
            for paper in to_check:
                progress.update(task, description=f"Resolving: {paper.title[:50]}...")
                result = resolve_s2_id(paper, s2, verbose=verbose)
                results.append(result)

                if write:
                    if result.s2_id:
                        if _write_s2_id(result):
                            write_count += 1
                    elif result.strategy == "failed":
                        if _mark_not_found(result):
                            fail_count += 1

                progress.advance(task)

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

    if write:
        console.print(f"[green]Updated {write_count} files, marked {fail_count} as not found[/green]")
    elif newly_resolved:
        console.print(f"[dim]Run with --write to save {len(newly_resolved)} resolved IDs[/dim]")

    return results


def _write_s2_id(result: ResolveResult) -> bool:
    """Write a single resolved s2_id back to its YAML file. Returns True if written."""
    if not result.s2_id or not result.paper.filename:
        return False
    path = PAPERS_DIR / result.paper.filename
    if not path.exists():
        return False

    text = path.read_text(encoding="utf-8")
    if "s2_id:" in text:
        return False

    if not text.endswith("\n"):
        text += "\n"
    text += f"s2_id: {result.s2_id}\n"
    path.write_text(text, encoding="utf-8")
    console.print(f"  [green]Wrote s2_id to {result.paper.filename}[/green]")
    return True


def _mark_not_found(result: ResolveResult) -> bool:
    """Write s2_id: none to mark a paper as unresolvable. Returns True if written."""
    if not result.paper.filename:
        return False
    path = PAPERS_DIR / result.paper.filename
    if not path.exists():
        return False

    text = path.read_text(encoding="utf-8")
    if "s2_id:" in text:
        return False

    if not text.endswith("\n"):
        text += "\n"
    text += "s2_id: none\n"
    path.write_text(text, encoding="utf-8")
    return True
