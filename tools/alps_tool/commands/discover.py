"""Citation-based candidate discovery + interactive add."""

from __future__ import annotations

from collections import Counter

from rich.console import Console
from rich.prompt import Confirm, Prompt

from alps_tool.api.cache import ApiCache
from alps_tool.api.semantic_scholar import SemanticScholarClient
from alps_tool.commands.report import (
    print_candidates,
    save_candidates_json,
    save_candidates_markdown,
)
from alps_tool.config import PAPERS_DIR, SPECIAL_LABELS
from alps_tool.models import Candidate, Paper, Publication
from alps_tool.papers import build_arxiv_index, build_s2_index, build_title_index, load_papers
from alps_tool.resolve import resolve_batch
from alps_tool.utils.filename import generate_filename
from alps_tool.utils.matching import normalise_title
from alps_tool.utils.yaml_format import paper_to_yaml

console = Console()


def run_discover(
    *,
    min_citations: int = 2,
    max_results: int = 50,
    interactive: bool = False,
    output_format: str = "terminal",
    verbose: bool = False,
    cache: ApiCache | None = None,
) -> list[Candidate]:
    """Discover new candidate papers via citation analysis."""
    papers = load_papers()
    console.print(f"Loaded {len(papers)} papers")

    s2 = SemanticScholarClient(cache=cache)

    # Resolve S2 IDs for all papers (uses cache for already-resolved)
    console.print("Resolving Semantic Scholar IDs...")
    resolve_results = resolve_batch(papers, s2, verbose=verbose)
    resolved_map = {r.paper.title: r.s2_id for r in resolve_results if r.s2_id}
    console.print(f"  {len(resolved_map)} papers with S2 IDs")

    # Build dedup indices
    title_index = build_title_index(papers)
    s2_index = build_s2_index(papers)
    arxiv_index = build_arxiv_index(papers)
    # Also track s2_ids from resolution
    all_s2_ids = set(s2_index.keys())
    for s2_id in resolved_map.values():
        all_s2_ids.add(s2_id)

    # Fetch citations for each resolved paper and count
    citing_counts: Counter[str] = Counter()  # s2_id → count of ALPS papers it cites
    citing_info: dict[str, dict] = {}  # s2_id → paper info
    citing_alps: dict[str, list[str]] = {}  # s2_id → list of ALPS paper titles cited

    papers_with_s2 = [(p, sid) for p, sid in zip(
        [r.paper for r in resolve_results],
        [r.s2_id for r in resolve_results],
    ) if sid]

    console.print(f"Fetching citations for {len(papers_with_s2)} papers...")
    from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("{task.completed}/{task.total}"),
    ) as progress:
        task = progress.add_task("Scanning citations...", total=len(papers_with_s2))
        for paper, s2_id in papers_with_s2:
            progress.update(task, description=f"Citations: {paper.title[:40]}...")
            citations = s2.get_citations(s2_id)
            for citing in citations:
                cid = citing.get("paperId")
                if not cid or cid in all_s2_ids:
                    continue  # skip papers already in ALPS

                # Check arxiv dedup
                ext_ids = citing.get("externalIds") or {}
                arxiv_id = ext_ids.get("ArXiv")
                if arxiv_id and arxiv_id in arxiv_index:
                    continue

                # Check title dedup
                ctitle = citing.get("title", "")
                if normalise_title(ctitle) in title_index:
                    continue

                citing_counts[cid] += 1
                if cid not in citing_info:
                    citing_info[cid] = citing
                if cid not in citing_alps:
                    citing_alps[cid] = []
                citing_alps[cid].append(paper.title)

            progress.advance(task)

    # Build candidates
    candidates: list[Candidate] = []
    for s2_id, count in citing_counts.most_common():
        if count < min_citations:
            break
        info = citing_info[s2_id]
        ext_ids = info.get("externalIds") or {}
        authors_list = info.get("authors") or []
        authors_str = ", ".join(a.get("name", "") for a in authors_list)

        # Suggest labels from cited papers
        cited_titles = citing_alps.get(s2_id, [])
        label_counts: Counter[str] = Counter()
        for t in cited_titles:
            nt = normalise_title(t)
            if nt in title_index:
                for label in title_index[nt].labels:
                    if label not in SPECIAL_LABELS:
                        label_counts[label] += 1
        suggested = [l for l, _ in label_counts.most_common(5)]

        candidates.append(Candidate(
            title=info.get("title", ""),
            authors=authors_str,
            year=info.get("year"),
            s2_id=s2_id,
            arxiv=ext_ids.get("ArXiv"),
            url=info.get("url"),
            cited_alps_papers=cited_titles,
            score=count,
            suggested_labels=suggested,
        ))

    candidates = candidates[:max_results]
    console.print(f"\n[bold]Found {len(candidates)} candidates[/bold] (min {min_citations} ALPS citations)")

    # Output
    if output_format == "json":
        save_candidates_json(candidates)
    elif output_format == "markdown":
        save_candidates_markdown(candidates)
    else:
        print_candidates(candidates)

    if interactive and candidates:
        _interactive_add(candidates, papers)

    return candidates


def _interactive_add(candidates: list[Candidate], existing_papers: list[Paper]) -> None:
    """Interactively review candidates and add to ALPS."""
    console.print("\n[bold]Interactive mode[/bold] — review candidates to add\n")

    for i, c in enumerate(candidates, 1):
        console.print(f"\n[bold cyan]── Candidate {i}/{len(candidates)} ──[/bold cyan]")
        console.print(f"  [bold]{c.title}[/bold]")
        console.print(f"  Authors: {c.authors}")
        console.print(f"  Year: {c.year or 'N/A'}")
        console.print(f"  Score: cites {c.score} ALPS papers")
        console.print(f"  Cites: {', '.join(c.cited_alps_papers[:5])}")
        if c.suggested_labels:
            console.print(f"  Suggested labels: {', '.join(c.suggested_labels)}")

        if not Confirm.ask("  Add this paper?", default=False):
            continue

        # Get labels
        default_labels = ", ".join(c.suggested_labels) if c.suggested_labels else ""
        labels_str = Prompt.ask("  Labels (comma-separated)", default=default_labels)
        labels = [l.strip() for l in labels_str.split(",") if l.strip()]

        # Build paper
        pubs = []
        if c.arxiv:
            pubs.append(Publication(
                name="arXiv",
                url=f"https://arxiv.org/abs/{c.arxiv}",
                year=c.year,
            ))

        paper = Paper(
            title=c.title,
            authors=c.authors,
            labels=labels,
            publications=pubs,
            year=c.year,
            arxiv=c.arxiv,
            s2_id=c.s2_id,
        )

        # Write YAML
        filename = generate_filename(c.title, c.authors, c.year)
        path = PAPERS_DIR / filename
        if path.exists():
            console.print(f"  [yellow]File {filename} already exists, skipping[/yellow]")
            continue

        yaml_content = paper_to_yaml(paper)
        path.write_text(yaml_content, encoding="utf-8")
        console.print(f"  [green]Created {filename}[/green]")
