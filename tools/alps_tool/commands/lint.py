"""Validate YAML paper files against the expected format."""

from __future__ import annotations

import fnmatch
from collections import Counter
from pathlib import Path

import yaml
from rich.console import Console

from alps_tool.config import PAPERS_DIR, PUBLICATION_FIELD_ORDER, YAML_FIELD_ORDER

console = Console()

_VALID_TOP_KEYS = set(YAML_FIELD_ORDER)
_VALID_PUB_KEYS = set(PUBLICATION_FIELD_ORDER)

_STRING_FIELDS = {"title", "authors", "abstract", "arxiv", "s2_id"}
_INT_FIELDS = {"year"}

_PUB_STRING_FIELDS = {"name", "url", "dblp_key", "bibtex"}
_PUB_INT_FIELDS = {"year", "month", "day"}


def run_lint(*, file_filter: str | None = None) -> int:
    """Validate all paper YAML files. Returns the number of errors."""
    papers_dir = PAPERS_DIR
    paths = sorted(
        p for p in papers_dir.iterdir() if p.suffix in (".yml", ".yaml")
    )
    if file_filter:
        paths = [p for p in paths if fnmatch.fnmatch(p.name, file_filter)]

    console.print(f"Checking {len(paths)} paper files...\n")

    # First pass: collect all labels across files for uniqueness check
    all_labels: Counter[str] = Counter()
    raw_data: list[tuple[Path, dict]] = []
    for path in paths:
        with open(path, encoding="utf-8") as f:
            data = yaml.safe_load(f)
        if not isinstance(data, dict):
            raw_data.append((path, {}))
            continue
        raw_data.append((path, data))
        for label in data.get("labels") or []:
            if isinstance(label, str):
                all_labels[label] += 1

    total_errors = 0
    total_warnings = 0

    for path, data in raw_data:
        errors: list[str] = []
        warnings: list[str] = []

        if not data:
            errors.append("file is empty or not a YAML mapping")
            _report(path.name, errors, warnings)
            total_errors += len(errors)
            continue

        # 1. Unknown top-level fields
        for key in data:
            if key not in _VALID_TOP_KEYS:
                errors.append(f"unknown field '{key}'")

        # 2. Required fields
        for req in ("title", "authors"):
            val = data.get(req)
            if not val:
                errors.append(f"missing required field '{req}'")
            elif not isinstance(val, str):
                errors.append(f"'{req}' must be a string, got {type(val).__name__}")

        # 3. Type checks for optional string fields
        for field in _STRING_FIELDS - {"title", "authors"}:
            val = data.get(field)
            if val is not None and not isinstance(val, str):
                errors.append(f"'{field}' must be a string, got {type(val).__name__}")

        # 4. Type check for year
        val = data.get("year")
        if val is not None and not isinstance(val, int):
            errors.append(f"'year' must be an integer, got {type(val).__name__}")

        # 5. Labels
        labels = data.get("labels")
        if labels is not None:
            if not isinstance(labels, list):
                errors.append(f"'labels' must be a list, got {type(labels).__name__}")
            else:
                for i, label in enumerate(labels):
                    if not isinstance(label, str):
                        errors.append(f"labels[{i}] must be a string, got {type(label).__name__}")
                    elif all_labels[label] == 1:
                        warnings.append(f"label '{label}' is unique to this file (typo?)")

        # 6. Publications
        pubs = data.get("publications")
        if pubs is not None:
            if not isinstance(pubs, list):
                errors.append(f"'publications' must be a list, got {type(pubs).__name__}")
            else:
                for i, pub in enumerate(pubs):
                    if not isinstance(pub, dict):
                        errors.append(f"publications[{i}] must be a mapping, got {type(pub).__name__}")
                        continue
                    _check_publication(pub, i, errors, warnings)

        # 7. Field order
        file_keys = [k for k in data if k in _VALID_TOP_KEYS]
        expected = [k for k in YAML_FIELD_ORDER if k in file_keys]
        if file_keys != expected:
            warnings.append(f"field order should be {expected}, got {file_keys}")

        if errors or warnings:
            _report(path.name, errors, warnings)
        total_errors += len(errors)
        total_warnings += len(warnings)

    # Summary
    console.print()
    color = "green" if total_errors == 0 else "red"
    console.print(
        f"[{color} bold]{len(paths)} files checked: "
        f"{total_errors} errors, {total_warnings} warnings[/{color} bold]"
    )
    return total_errors


def _check_publication(pub: dict, idx: int, errors: list[str], warnings: list[str]) -> None:
    prefix = f"publications[{idx}]"

    # Unknown keys
    for key in pub:
        if key not in _VALID_PUB_KEYS:
            errors.append(f"{prefix}: unknown field '{key}'")

    # Required: name
    name = pub.get("name")
    if not name:
        errors.append(f"{prefix}: missing required field 'name'")
    elif not isinstance(name, str):
        errors.append(f"{prefix}: 'name' must be a string")

    # String fields
    for field in _PUB_STRING_FIELDS - {"name"}:
        val = pub.get(field)
        if val is not None and not isinstance(val, str):
            errors.append(f"{prefix}: '{field}' must be a string, got {type(val).__name__}")

    # Int fields
    for field in _PUB_INT_FIELDS:
        val = pub.get(field)
        if val is not None and not isinstance(val, int):
            errors.append(f"{prefix}: '{field}' must be an integer, got {type(val).__name__}")

    # Publication field order
    pub_keys = [k for k in pub if k in _VALID_PUB_KEYS]
    expected = [k for k in PUBLICATION_FIELD_ORDER if k in pub_keys]
    if pub_keys != expected:
        warnings.append(f"{prefix}: field order should be {expected}, got {pub_keys}")


def _report(filename: str, errors: list[str], warnings: list[str]) -> None:
    console.print(f"[bold]{filename}[/bold]")
    for e in errors:
        console.print(f"  [red]ERROR[/red] {e}")
    for w in warnings:
        console.print(f"  [yellow]WARN[/yellow]  {w}")
