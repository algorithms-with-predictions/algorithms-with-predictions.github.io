"""LLM-based label suggestions for papers via OpenRouter."""

from __future__ import annotations

import glob as globmod
import re
from collections import Counter

from rich.console import Console
from rich.prompt import Prompt

from alps_tool.api.cache import ApiCache
from alps_tool.api.openrouter import OpenRouterClient
from alps_tool.api.semantic_scholar import SemanticScholarClient
from alps_tool.config import PAPERS_DIR
from alps_tool.papers import load_papers

console = Console()

SYSTEM_PROMPT = """\
You are an expert in theoretical computer science, specifically the field of \
"Algorithms with Predictions" (also called learning-augmented algorithms). \
Papers in this field design algorithms that receive machine-learned predictions \
as extra input and aim to beat traditional worst-case guarantees when \
predictions are accurate, while maintaining robustness when they are not.

You will be given a paper's title and abstract and must assign 2-5 labels from \
the provided label set. Choose only labels from the list. Return ONLY a \
comma-separated list of labels, nothing else."""


def _build_user_prompt(title: str, abstract: str | None, label_list: str) -> str:
    parts = [f"Title: {title}"]
    if abstract:
        parts.append(f"Abstract: {abstract}")
    parts.append(f"\nAvailable labels (with usage counts):\n{label_list}")
    parts.append("\nReturn 2-5 labels from the list above, comma-separated:")
    return "\n\n".join(parts)


def _build_label_list(papers) -> str:
    """Build a formatted label list with counts from the corpus."""
    counts: Counter[str] = Counter()
    for p in papers:
        for label in p.labels:
            counts[label] += 1
    lines = []
    for label, count in counts.most_common():
        lines.append(f"  {label} ({count})")
    return "\n".join(lines)


def _parse_labels(response: str, known_labels: set[str]) -> list[str]:
    """Parse comma-separated labels from LLM response, filtering to known labels."""
    raw = [l.strip().strip('"').strip("'").lower() for l in response.split(",")]
    # Build case-insensitive lookup
    lower_to_canonical = {l.lower(): l for l in known_labels}
    labels = []
    for r in raw:
        if r in lower_to_canonical and lower_to_canonical[r] not in labels:
            labels.append(lower_to_canonical[r])
    return labels


def _write_labels_to_yaml(filename: str, labels: list[str]) -> bool:
    """Write labels to a paper's YAML file, replacing existing labels block."""
    path = PAPERS_DIR / filename
    if not path.exists():
        return False

    text = path.read_text(encoding="utf-8")
    lines = text.split("\n")

    # Find existing labels block and replace, or insert after authors
    new_label_lines = ["labels:"] + [f"- {l}" for l in labels]

    # Check if labels block exists
    label_start = None
    label_end = None
    for i, line in enumerate(lines):
        if line.rstrip() == "labels:":
            label_start = i
            label_end = i + 1
            # Find end of label list
            while label_end < len(lines) and lines[label_end].startswith("- "):
                label_end += 1
            break

    if label_start is not None:
        lines[label_start:label_end] = new_label_lines
    else:
        # Insert after authors line
        insert_at = None
        for i, line in enumerate(lines):
            if line.startswith("authors:"):
                insert_at = i + 1
                break
            if line.startswith("authors:"):
                insert_at = i + 1
                break
        if insert_at is None:
            # Fallback: insert after title
            for i, line in enumerate(lines):
                if line.startswith("title:"):
                    insert_at = i + 1
                    break
        if insert_at is None:
            insert_at = 0
        # Skip abstract if present right after authors
        if insert_at < len(lines) and lines[insert_at].startswith("abstract:"):
            insert_at += 1
        lines[insert_at:insert_at] = new_label_lines

    path.write_text("\n".join(lines), encoding="utf-8")
    return True


def _fetch_abstract(paper, s2: SemanticScholarClient) -> str | None:
    """Fetch abstract from Semantic Scholar if paper has s2_id."""
    if not paper.s2_id or paper.s2_id == "none":
        return None
    data = s2.get_paper(paper.s2_id)
    if data:
        return data.get("abstract")
    return None


def run_label(
    *,
    file_filter: str | None = None,
    relabel_all: bool = False,
    model: str | None = None,
    verbose: bool = False,
    cache: ApiCache | None = None,
) -> None:
    """Suggest labels for papers using an LLM via OpenRouter."""
    try:
        llm = OpenRouterClient(model=model)
    except RuntimeError as e:
        console.print(f"[red bold]Error:[/red bold] {e}")
        return
    s2 = SemanticScholarClient(cache=cache)

    papers = load_papers()
    console.print(f"Loaded {len(papers)} papers")

    # Filter by filename glob
    if file_filter:
        pattern = file_filter if "*" in file_filter else f"*{file_filter}*"
        matched_files = set()
        for ext in (".yml", ".yaml"):
            pat = pattern if pattern.endswith(ext) else pattern + ext
            for match in globmod.glob(str(PAPERS_DIR / pat)):
                matched_files.add(match.split("/")[-1])
            # Also try without extension addition if pattern already has one
            for match in globmod.glob(str(PAPERS_DIR / pattern)):
                matched_files.add(match.split("/")[-1])
        papers = [p for p in papers if p.filename in matched_files]
        console.print(f"  Filtered to {len(papers)} papers matching '{file_filter}'")

    # Filter to papers needing labels
    if relabel_all:
        papers.sort(key=lambda p: len(p.labels))
    else:
        papers = [p for p in papers if not p.labels]
        console.print(f"  {len(papers)} papers without labels")

    if not papers:
        console.print("[green]No papers need labeling.[/green]")
        return

    # Build label reference from full corpus
    all_papers = load_papers()
    label_list = _build_label_list(all_papers)
    known_labels: set[str] = set()
    for p in all_papers:
        known_labels.update(p.labels)

    labeled = 0
    skipped = 0

    for i, paper in enumerate(papers, 1):
        console.print(f"\n[bold cyan]── Paper {i}/{len(papers)} ──[/bold cyan]")
        console.print(f"  [bold]{paper.title}[/bold]")
        console.print(f"  Authors: {paper.authors}")
        if paper.labels:
            console.print(f"  Current labels: {', '.join(paper.labels)}")

        # Get abstract
        abstract = paper.abstract
        if not abstract and paper.s2_id:
            console.print("  [dim]Fetching abstract from S2...[/dim]")
            abstract = _fetch_abstract(paper, s2)
            if abstract:
                console.print(f"  [dim]Abstract: {abstract[:100]}...[/dim]")

        if not abstract:
            console.print("  [yellow]No abstract available[/yellow]")

        # Call LLM
        user_prompt = _build_user_prompt(paper.title, abstract, label_list)
        if verbose:
            console.print(f"  [dim]Prompt length: {len(user_prompt)} chars[/dim]")

        try:
            response = llm.complete(SYSTEM_PROMPT, user_prompt)
        except Exception as e:
            console.print(f"  [red]LLM error: {e}[/red]")
            skipped += 1
            continue

        suggested = _parse_labels(response, known_labels)
        if not suggested:
            console.print(f"  [yellow]Could not parse labels from response: {response}[/yellow]")
            skipped += 1
            continue

        console.print("  Suggested:")
        for j, label in enumerate(suggested, 1):
            console.print(f"    [green]{j}.[/green] {label}")

        # Interactive: toggle individual labels, add custom, or skip
        console.print("  [dim]Enter: accept all | numbers to toggle off | e: edit | s: skip[/dim]")
        choice = Prompt.ask("  ", default="").strip()

        if choice.lower() == "s":
            skipped += 1
            continue

        if choice.lower() == "e":
            labels_str = Prompt.ask("  Labels (comma-separated)", default=", ".join(suggested))
            labels = [l.strip() for l in labels_str.split(",") if l.strip()]
        elif choice == "":
            labels = suggested
        else:
            # Parse numbers to toggle off
            remove_indices: set[int] = set()
            for token in re.split(r"[,\s]+", choice):
                token = token.strip()
                if token.isdigit():
                    remove_indices.add(int(token))
            labels = [l for j, l in enumerate(suggested, 1) if j not in remove_indices]
            if not labels:
                console.print("  [yellow]All labels removed, skipping[/yellow]")
                skipped += 1
                continue
            console.print(f"  Selected: [green]{', '.join(labels)}[/green]")

        # Write to YAML
        if paper.filename and _write_labels_to_yaml(paper.filename, labels):
            console.print(f"  [green]Wrote labels to {paper.filename}[/green]")
            labeled += 1
        else:
            console.print(f"  [red]Failed to write labels[/red]")
            skipped += 1

    console.print(f"\n[bold]Done:[/bold] {labeled} labeled, {skipped} skipped")
