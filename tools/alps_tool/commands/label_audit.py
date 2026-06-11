"""Audit the paper label taxonomy and generate an editorial review report."""

from __future__ import annotations

from collections import Counter, defaultdict
from pathlib import Path
import re

import yaml
from rich.console import Console

from alps_tool.config import LABEL_VOCABULARY_PATH, REPORTS_DIR
from alps_tool.models import Paper
from alps_tool.papers import load_papers

console = Console()


def run_label_audit(
    *,
    output: Path | None = None,
    low_count: int = 2,
    max_keyword_hints: int = 80,
) -> Path:
    """Generate a label taxonomy audit report and return the report path."""
    papers = load_papers()
    vocabulary = _load_vocabulary()
    output = output or REPORTS_DIR / "label-audit.md"
    output.parent.mkdir(parents=True, exist_ok=True)

    report = _build_report(
        papers=papers,
        vocabulary=vocabulary,
        low_count=low_count,
        max_keyword_hints=max_keyword_hints,
    )
    output.write_text(report, encoding="utf-8")
    console.print(f"[green]Wrote label audit report:[/green] {output}")
    return output


def _load_vocabulary() -> dict:
    with open(LABEL_VOCABULARY_PATH, encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if not isinstance(data, dict):
        raise ValueError(f"Invalid vocabulary file: {LABEL_VOCABULARY_PATH}")
    return data


def _build_report(
    *,
    papers: list[Paper],
    vocabulary: dict,
    low_count: int,
    max_keyword_hints: int,
) -> str:
    label_counts: Counter[str] = Counter()
    label_to_papers: dict[str, list[Paper]] = defaultdict(list)
    for paper in papers:
        for label in paper.labels:
            label_counts[label] += 1
            label_to_papers[label].append(paper)

    type_labels = set(vocabulary.get("type_labels") or [])
    prior_label = vocabulary.get("prior_label")
    canonical_topics = set(vocabulary.get("canonical_topics") or [])
    aliases: dict[str, str] = vocabulary.get("aliases") or {}
    broad_labels: dict[str, str] = vocabulary.get("broad_labels") or {}
    review_labels: dict[str, str] = vocabulary.get("review_labels") or {}

    known_labels = (
        type_labels
        | canonical_topics
        | set(aliases)
        | set(broad_labels)
        | set(review_labels)
        | ({prior_label} if prior_label else set())
    )

    unknown_labels = sorted(label for label in label_counts if label not in known_labels)
    alias_usages = sorted(
        (label, target, label_to_papers[label])
        for label, target in aliases.items()
        if label in label_counts
    )
    broad_usages = sorted(
        (label, reason, label_counts[label])
        for label, reason in broad_labels.items()
        if label in label_counts
    )
    review_usages = sorted(
        (label, reason, label_to_papers[label])
        for label, reason in review_labels.items()
        if label in label_counts
    )
    low_count_labels = sorted(
        (label, count)
        for label, count in label_counts.items()
        if count <= low_count
        and label not in type_labels
        and label != prior_label
        and label not in aliases
    )
    many_label_papers = sorted(
        (
            (paper, len(paper.labels))
            for paper in papers
            if len(paper.labels) >= 5
        ),
        key=lambda item: item[0].filename,
    )
    missing_abstract = sorted(
        (paper for paper in papers if not paper.abstract),
        key=lambda paper: paper.filename,
    )
    keyword_hints = _keyword_hints(
        papers=papers,
        keyword_config=vocabulary.get("keyword_hints") or {},
        max_hints=max_keyword_hints,
    )

    lines: list[str] = []
    lines.append("# Label Taxonomy Audit")
    lines.append("")
    lines.append("Generated from local YAML files. This report is advisory: do not apply ambiguous label changes without review.")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- Papers: **{len(papers)}**")
    lines.append(f"- Distinct labels: **{len(label_counts)}**")
    lines.append(f"- Papers with abstracts: **{sum(1 for p in papers if p.abstract)}**")
    lines.append(f"- Papers without abstracts: **{len(missing_abstract)}**")
    lines.append(f"- Mechanical alias candidates: **{sum(len(items) for _, _, items in alias_usages)}**")
    lines.append(f"- Unknown labels: **{len(unknown_labels)}**")
    lines.append(f"- Labels used at most {low_count} time(s): **{len(low_count_labels)}**")
    lines.append(f"- Papers with 5+ labels: **{len(many_label_papers)}**")
    lines.append("")

    lines.extend(_label_usage_section(label_counts, vocabulary))
    lines.extend(_alias_section(alias_usages))
    lines.extend(_broad_label_section(broad_usages))
    lines.extend(_review_label_section(review_usages))
    lines.extend(_unknown_label_section(unknown_labels, label_to_papers))
    lines.extend(_low_count_section(low_count_labels, label_to_papers))
    lines.extend(_many_label_section(many_label_papers))
    lines.extend(_keyword_hint_section(keyword_hints))
    lines.extend(_missing_abstract_section(missing_abstract))
    lines.extend(_suggested_workflow_section())

    return "\n".join(lines) + "\n"


def _label_usage_section(label_counts: Counter[str], vocabulary: dict) -> list[str]:
    type_labels = set(vocabulary.get("type_labels") or [])
    prior_label = vocabulary.get("prior_label")
    canonical_topics = set(vocabulary.get("canonical_topics") or [])
    aliases = set((vocabulary.get("aliases") or {}).keys())
    broad_labels = set((vocabulary.get("broad_labels") or {}).keys())
    review_labels = set((vocabulary.get("review_labels") or {}).keys())

    lines = ["## Label Usage", "", "| Label | Count | Status |", "|---|---:|---|"]
    for label, count in label_counts.most_common():
        if label in type_labels:
            status = "type"
        elif label == prior_label:
            status = "prior"
        elif label in aliases:
            status = "alias"
        elif label in broad_labels:
            status = "broad"
        elif label in review_labels:
            status = "review"
        elif label in canonical_topics:
            status = "canonical topic"
        else:
            status = "unknown"
        lines.append(f"| `{label}` | {count} | {status} |")
    lines.append("")
    return lines


def _alias_section(alias_usages: list[tuple[str, str, list[Paper]]]) -> list[str]:
    lines = ["## Mechanical Alias Candidates", ""]
    if not alias_usages:
        lines.append("No alias labels currently used.")
        lines.append("")
        return lines

    for label, target, papers in alias_usages:
        lines.append(f"### `{label}` -> `{target}`")
        lines.append("")
        for paper in papers:
            lines.append(f"- `{paper.filename}`: {paper.title}")
        lines.append("")
    return lines


def _broad_label_section(broad_usages: list[tuple[str, str, int]]) -> list[str]:
    lines = ["## Broad Labels Needing Policy", ""]
    if not broad_usages:
        lines.append("No configured broad labels are currently used.")
        lines.append("")
        return lines

    for label, reason, count in broad_usages:
        lines.append(f"- `{label}` ({count} papers): {reason}")
    lines.append("")
    return lines


def _review_label_section(review_usages: list[tuple[str, str, list[Paper]]]) -> list[str]:
    lines = ["## Labels Requiring Editorial Review", ""]
    if not review_usages:
        lines.append("No configured review labels are currently used.")
        lines.append("")
        return lines

    for label, reason, papers in review_usages:
        lines.append(f"### `{label}`")
        lines.append("")
        lines.append(reason)
        lines.append("")
        for paper in papers:
            lines.append(f"- `{paper.filename}`: {paper.title}")
        lines.append("")
    return lines


def _unknown_label_section(
    unknown_labels: list[str],
    label_to_papers: dict[str, list[Paper]],
) -> list[str]:
    lines = ["## Unknown Labels", ""]
    if not unknown_labels:
        lines.append("No labels outside the configured vocabulary.")
        lines.append("")
        return lines

    for label in unknown_labels:
        lines.append(f"### `{label}`")
        lines.append("")
        for paper in label_to_papers[label]:
            lines.append(f"- `{paper.filename}`: {paper.title}")
        lines.append("")
    return lines


def _low_count_section(
    low_count_labels: list[tuple[str, int]],
    label_to_papers: dict[str, list[Paper]],
) -> list[str]:
    lines = ["## Low-Frequency Labels", ""]
    if not low_count_labels:
        lines.append("No low-frequency labels under the configured threshold.")
        lines.append("")
        return lines

    for label, count in low_count_labels:
        lines.append(f"### `{label}` ({count})")
        lines.append("")
        for paper in label_to_papers[label]:
            lines.append(f"- `{paper.filename}`: {paper.title}")
        lines.append("")
    return lines


def _many_label_section(many_label_papers: list[tuple[Paper, int]]) -> list[str]:
    lines = ["## Papers With 5+ Labels", ""]
    if not many_label_papers:
        lines.append("No papers have 5 or more labels.")
        lines.append("")
        return lines

    for paper, count in many_label_papers:
        lines.append(f"- `{paper.filename}` ({count}): {paper.title}")
        lines.append(f"  Current labels: {', '.join(f'`{label}`' for label in paper.labels)}")
    lines.append("")
    return lines


def _keyword_hints(
    *,
    papers: list[Paper],
    keyword_config: dict[str, list[str]],
    max_hints: int,
) -> list[tuple[Paper, str, str]]:
    hints: list[tuple[Paper, str, str]] = []
    compiled = {
        label: [(keyword, _keyword_pattern(keyword)) for keyword in keywords]
        for label, keywords in keyword_config.items()
    }
    for paper in papers:
        text = f"{paper.title}\n{paper.abstract or ''}"
        current = set(paper.labels)
        for label, patterns in compiled.items():
            if label in current:
                continue
            for keyword, pattern in patterns:
                if pattern.search(text):
                    hints.append((paper, label, keyword))
                    break
            if len(hints) >= max_hints:
                return hints
    return hints


def _keyword_pattern(keyword: str) -> re.Pattern[str]:
    escaped = re.escape(keyword)
    if keyword.isupper():
        return re.compile(rf"\b{escaped}\b")
    return re.compile(rf"\b{escaped}\b", re.IGNORECASE)


def _keyword_hint_section(keyword_hints: list[tuple[Paper, str, str]]) -> list[str]:
    lines = ["## Keyword-Based Missing-Label Hints", ""]
    if not keyword_hints:
        lines.append("No keyword hints generated.")
        lines.append("")
        return lines

    lines.append(
        "These are title/abstract keyword matches only. Treat them as review prompts, not automatic edits."
    )
    lines.append("")
    for paper, label, keyword in keyword_hints:
        lines.append(
            f"- `{paper.filename}`: consider `{label}` because of keyword `{keyword}`"
        )
        lines.append(f"  Title: {paper.title}")
    lines.append("")
    return lines


def _missing_abstract_section(missing_abstract: list[Paper]) -> list[str]:
    lines = ["## Papers Without Abstracts", ""]
    if not missing_abstract:
        lines.append("All papers have abstracts.")
        lines.append("")
        return lines

    lines.append(
        "These papers are harder to relabel automatically; title-only suggestions will be less reliable."
    )
    lines.append("")
    for paper in missing_abstract:
        lines.append(f"- `{paper.filename}`: {paper.title}")
    lines.append("")
    return lines


def _suggested_workflow_section() -> list[str]:
    return [
        "## Suggested Next Steps",
        "",
        "1. Apply only the mechanical alias fixes first.",
        "2. Decide policy for broad labels, especially `online`, `learning`, and `graph problems`.",
        "3. Review labels in the editorial queue and either promote them to canonical topics or merge them.",
        "4. Review keyword hints in small batches and update labels manually.",
        "5. Once stable, make the vocabulary enforceable in lint.",
        "",
    ]
