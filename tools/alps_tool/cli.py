"""Click CLI: discover, update, resolve, stats commands."""

from __future__ import annotations

import logging

import click
from rich.console import Console
from rich.table import Table

from alps_tool.api.cache import ApiCache

console = Console()


@click.group()
@click.option("--no-cache", is_flag=True, help="Skip API cache")
@click.option("--verbose", "-v", is_flag=True, help="Debug output")
@click.pass_context
def cli(ctx: click.Context, no_cache: bool, verbose: bool) -> None:
    """ALPS Paper Discovery & Update Tool."""
    ctx.ensure_object(dict)
    ctx.obj["cache"] = ApiCache(enabled=not no_cache)
    ctx.obj["verbose"] = verbose
    if verbose:
        logging.basicConfig(level=logging.DEBUG)


@cli.command()
@click.option("--min-citations", default=2, help="Min ALPS papers cited (default 2)")
@click.option("--max-results", default=50, help="Max candidates to show")
@click.option("-i", "--interactive", is_flag=True, help="Review & add candidates")
@click.option("-o", "--output", "output_format", default="terminal",
              type=click.Choice(["terminal", "json", "markdown"]))
@click.pass_context
def discover(ctx: click.Context, min_citations: int, max_results: int,
             interactive: bool, output_format: str) -> None:
    """Discover new candidate papers via citation analysis."""
    from alps_tool.commands.discover import run_discover
    run_discover(
        min_citations=min_citations,
        max_results=max_results,
        interactive=interactive,
        output_format=output_format,
        verbose=ctx.obj["verbose"],
        cache=ctx.obj["cache"],
    )


@cli.command()
@click.option("-i", "--interactive", is_flag=True, help="Review & add new publications")
@click.option("-f", "--filter", "file_filter", help="Filename glob filter (e.g. 'Davies24*')")
@click.pass_context
def update(ctx: click.Context, interactive: bool, file_filter: str | None) -> None:
    """Check existing papers for new publications/venues."""
    from alps_tool.commands.update import run_update
    run_update(
        interactive=interactive,
        file_filter=file_filter,
        verbose=ctx.obj["verbose"],
        cache=ctx.obj["cache"],
    )


@cli.command()
@click.option("--write", is_flag=True, help="Write s2_id back to YAML files")
@click.pass_context
def resolve(ctx: click.Context, write: bool) -> None:
    """Resolve missing Semantic Scholar IDs."""
    from alps_tool.commands.resolve_ids import run_resolve
    run_resolve(
        write=write,
        verbose=ctx.obj["verbose"],
        cache=ctx.obj["cache"],
    )


@cli.group()
def dblp() -> None:
    """Manage local DBLP database."""


@dblp.command()
@click.option("--force", is_flag=True, help="Re-download even if files exist")
def ingest(force: bool) -> None:
    """Download dblp.xml.gz and build a local SQLite index."""
    from alps_tool.dblp_local import build_index, download_dblp_dump

    console.print("[bold]Step 1/2:[/bold] Downloading DBLP dump...")
    download_dblp_dump(force=force)

    console.print("\n[bold]Step 2/2:[/bold] Building SQLite + FTS5 index...")
    count = build_index()
    console.print(f"\n[green bold]Done![/green bold] Indexed {count:,} records.")


@dblp.command()
def status() -> None:
    """Show local DBLP database status."""
    from alps_tool.dblp_local import status as dblp_status

    info = dblp_status()
    if not info["exists"]:
        console.print("[yellow]No local DBLP database found.[/yellow]")
        console.print("Run [bold]alps dblp ingest[/bold] to build it.")
        return

    console.print("[bold]DBLP Local Database[/bold]")
    console.print(f"  Ingest date:  {info['ingest_date']}")
    console.print(f"  Records:      {int(info['record_count']):,}")
    console.print(f"  DB size:      {info['db_size_mb']} MB")


@cli.command()
@click.pass_context
def stats(ctx: click.Context) -> None:
    """Show collection statistics."""
    from collections import Counter
    from alps_tool.papers import load_papers

    papers = load_papers()

    # Basic counts
    console.print(f"\n[bold]ALPS Collection Stats[/bold]")
    console.print(f"  Total papers: {len(papers)}")

    # ID coverage
    has_s2 = sum(1 for p in papers if p.s2_id)
    has_arxiv = sum(1 for p in papers if p.arxiv)
    has_abstract = sum(1 for p in papers if p.abstract)
    console.print(f"  With s2_id: {has_s2} ({100*has_s2//len(papers)}%)")
    console.print(f"  With arxiv: {has_arxiv} ({100*has_arxiv//len(papers)}%)")
    console.print(f"  With abstract: {has_abstract} ({100*has_abstract//len(papers)}%)")

    # Labels
    label_counts: Counter[str] = Counter()
    for p in papers:
        for l in p.labels:
            label_counts[l] += 1

    table = Table(title="Labels")
    table.add_column("Label", max_width=40)
    table.add_column("Count", justify="right", width=6)
    for label, count in label_counts.most_common():
        table.add_row(label, str(count))
    console.print(table)

    # Venues
    venue_counts: Counter[str] = Counter()
    for p in papers:
        for pub in p.publications:
            venue_counts[pub.name] += 1

    table = Table(title="Top Venues")
    table.add_column("Venue", max_width=30)
    table.add_column("Count", justify="right", width=6)
    for venue, count in venue_counts.most_common(20):
        table.add_row(venue, str(count))
    console.print(table)

    # Year distribution
    year_counts: Counter[int] = Counter()
    for p in papers:
        for pub in p.publications:
            if pub.year and pub.name != "arXiv":
                year_counts[pub.year] += 1

    table = Table(title="Publications by Year (excl. arXiv)")
    table.add_column("Year", width=6)
    table.add_column("Count", justify="right", width=6)
    for year in sorted(year_counts.keys()):
        table.add_row(str(year), str(year_counts[year]))
    console.print(table)
