"""New publication detection + interactive update for existing papers."""

from __future__ import annotations

import fnmatch

from rich.console import Console
from rich.prompt import Confirm

from alps_tool.api.dblp import DblpClient
from alps_tool.commands.report import print_new_publications
from alps_tool.config import PAPERS_DIR
from alps_tool.models import NewPublication, Paper, Publication
from alps_tool.papers import load_papers
from alps_tool.utils.matching import normalise_venue, titles_match
from alps_tool.utils.yaml_format import publication_to_yaml_fragment

console = Console()


def run_update(
    *,
    interactive: bool = False,
    file_filter: str | None = None,
    verbose: bool = False,
    cache=None,
) -> list[NewPublication]:
    """Check existing papers for new publications/venues."""
    papers = load_papers()
    console.print(f"Loaded {len(papers)} papers")

    if file_filter:
        papers = [p for p in papers if p.filename and fnmatch.fnmatch(p.filename, file_filter)]
        console.print(f"  Filtered to {len(papers)} papers matching '{file_filter}'")

    dblp = DblpClient()

    new_pubs: list[NewPublication] = []

    from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("{task.completed}/{task.total}"),
    ) as progress:
        task = progress.add_task("Checking papers...", total=len(papers))
        for paper in papers:
            progress.update(task, description=f"Checking: {paper.title[:40]}...")

            # Check local DBLP index for publications
            dblp_pubs = _check_dblp_venues(paper, dblp)
            new_pubs.extend(dblp_pubs)

            progress.advance(task)

    console.print(f"\n[bold]Found {len(new_pubs)} new publications[/bold]")
    print_new_publications(new_pubs)

    if interactive and new_pubs:
        _interactive_update(new_pubs)

    return new_pubs


def _check_dblp_venues(paper: Paper, dblp: DblpClient) -> list[NewPublication]:
    """Search DBLP for publications of this paper not yet recorded."""
    results = dblp.search_publications(paper.title, max_results=5)
    new_pubs: list[NewPublication] = []

    existing_venues = {normalise_venue(p.name).lower() for p in paper.publications}
    existing_dblp_keys = {p.dblp_key for p in paper.publications if p.dblp_key}

    for hit in results:
        hit_title = hit.get("title", "").rstrip(".")
        if not titles_match(paper.title, hit_title):
            continue

        dblp_key = hit.get("key", "")
        if dblp_key in existing_dblp_keys:
            continue

        venue_name = hit.get("venue", "")
        if not venue_name:
            continue

        venue_name = normalise_venue(venue_name)
        if venue_name.lower() in existing_venues:
            continue
        if venue_name.lower() == "arxiv" or venue_name.lower() == "corr":
            continue

        year = None
        try:
            year = int(hit.get("year", 0))
        except (ValueError, TypeError):
            pass

        url = hit.get("ee", hit.get("url", ""))
        # DBLP sometimes returns list of URLs
        if isinstance(url, list):
            url = url[0] if url else ""

        bibtex = dblp.get_bibtex(dblp_key)

        pub = Publication(
            name=venue_name,
            url=url or None,
            year=year,
            dblp_key=dblp_key,
            bibtex=bibtex,
        )
        new_pubs.append(NewPublication(paper=paper, publication=pub, source="dblp", matched_title=hit_title))

    return new_pubs


def _interactive_update(new_pubs: list[NewPublication]) -> None:
    """Interactively review and add new publications to YAML files."""
    console.print("\n[bold]Interactive mode[/bold] — review new publications\n")

    for np in new_pubs:
        console.print(f"\n[bold cyan]── {np.paper.title[:60]} ──[/bold cyan]")
        if np.matched_title and np.matched_title != np.paper.title:
            console.print(f"  ALPS title:  {np.paper.title}")
            console.print(f"  DBLP title:  {np.matched_title}")
        console.print(f"  New venue: [bold]{np.publication.name}[/bold] ({np.publication.year or 'N/A'})")
        console.print(f"  Source: {np.source}")
        if np.publication.url:
            console.print(f"  URL: {np.publication.url}")

        if not Confirm.ask("  Add this publication?", default=True):
            continue

        if not np.paper.filename:
            console.print("  [yellow]No filename, skipping[/yellow]")
            continue

        path = PAPERS_DIR / np.paper.filename
        if not path.exists():
            console.print(f"  [yellow]File not found: {np.paper.filename}[/yellow]")
            continue

        # Append publication to the YAML file
        text = path.read_text(encoding="utf-8")
        fragment = publication_to_yaml_fragment(np.publication)
        # Insert before any top-level fields that come after publications
        # Simple approach: append after the last publication entry
        if not text.endswith("\n"):
            text += "\n"

        # Find the publications section and append
        lines = text.split("\n")
        insert_idx = _find_publications_end(lines)
        if insert_idx is not None:
            lines.insert(insert_idx, fragment)
            path.write_text("\n".join(lines), encoding="utf-8")
            console.print(f"  [green]Added {np.publication.name} to {np.paper.filename}[/green]")
        else:
            console.print(f"  [yellow]Could not find publications section in {np.paper.filename}[/yellow]")


def _find_publications_end(lines: list[str]) -> int | None:
    """Find the line index after the last publication entry."""
    in_publications = False
    last_pub_end = None

    for i, line in enumerate(lines):
        if line.startswith("publications:"):
            in_publications = True
            continue
        if in_publications:
            if line.startswith("- ") or line.startswith("  "):
                last_pub_end = i + 1
            elif line.strip() and not line.startswith(" ") and not line.startswith("-"):
                # Hit a new top-level key
                break

    return last_pub_end
