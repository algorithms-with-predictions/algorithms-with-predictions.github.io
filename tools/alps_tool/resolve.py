"""Multi-strategy Semantic Scholar ID resolution pipeline."""

from __future__ import annotations

from dataclasses import dataclass

from rich.progress import Progress, SpinnerColumn, TextColumn

from alps_tool.models import Paper
from alps_tool.utils.matching import titles_match


@dataclass
class ResolveResult:
    paper: Paper
    s2_id: str | None
    strategy: str  # "cached", "arxiv", "dblp", "title_search", "failed"


def resolve_s2_id(
    paper: Paper, s2_client, *, verbose: bool = False, cheap_only: bool = False,
) -> ResolveResult:
    """Try multiple strategies to find a Semantic Scholar paper ID.

    If cheap_only=True, skip the title search strategy (avoids the
    rate-limited /search endpoint).
    """
    # Strategy 1: already has s2_id (skip sentinel "none")
    if paper.s2_id and paper.s2_id != "none":
        return ResolveResult(paper, paper.s2_id, "cached")

    # Strategy 2: resolve via arxiv ID
    if paper.arxiv:
        result = s2_client.get_paper(f"arxiv:{paper.arxiv}")
        if result and result.get("paperId"):
            return ResolveResult(paper, result["paperId"], "arxiv")

    # Strategy 3: resolve via DBLP key
    for pub in paper.publications:
        if pub.dblp_key:
            result = s2_client.get_paper(f"DBLP:{pub.dblp_key}")
            if result and result.get("paperId"):
                return ResolveResult(paper, result["paperId"], "dblp")

    if not cheap_only:
        # Strategy 4: title search with fuzzy match confirmation
        results = s2_client.search(paper.title, limit=3)
        for r in results:
            if r.get("title") and titles_match(paper.title, r["title"]):
                return ResolveResult(paper, r["paperId"], "title_search")

    return ResolveResult(paper, None, "failed")


def resolve_batch(
    papers: list[Paper],
    s2_client,
    *,
    verbose: bool = False,
    skip_resolved: bool = True,
    cheap_only: bool = False,
) -> list[ResolveResult]:
    """Resolve S2 IDs for a batch of papers with progress display.

    If cheap_only=True, only use s2_id/arxiv/dblp_key lookups (no title search).
    """
    results: list[ResolveResult] = []
    to_resolve = papers if not skip_resolved else [p for p in papers if not p.s2_id]
    already_resolved = [p for p in papers if p.s2_id] if skip_resolved else []

    # Add cached results for already-resolved papers
    for p in already_resolved:
        results.append(ResolveResult(p, p.s2_id, "cached"))

    if not to_resolve:
        return results

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        transient=True,
    ) as progress:
        task = progress.add_task("Resolving S2 IDs...", total=len(to_resolve))
        for paper in to_resolve:
            progress.update(task, description=f"Resolving: {paper.title[:50]}...")
            result = resolve_s2_id(paper, s2_client, verbose=verbose, cheap_only=cheap_only)
            results.append(result)
            progress.advance(task)

    return results
