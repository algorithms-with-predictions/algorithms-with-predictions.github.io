#!/usr/bin/env python3
"""
YAML Paper Formatter
===================

A script to format academic paper YAML files in a consistent way.
Features:
- Standardized field ordering
- Proper YAML formatting
- Clean up escaped strings
- Validate data integrity
- Sort publications by importance
- Format BibTeX entries nicely
"""

import argparse
import logging
import re
import shutil
import sys
from pathlib import Path
from typing import Dict, List, Optional, Any
import yaml

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class YAMLFormatter:
    """Format YAML paper files consistently."""

    # Standard field order for papers
    PAPER_FIELD_ORDER = ["title", "authors", "labels", "publications"]

    # Standard field order for publications
    PUBLICATION_FIELD_ORDER = [
        "name",
        "url",
        "year",
        "month",
        "day",
        "dblp_key",
        "bibtex",
    ]

    # Publication importance order (for sorting)
    VENUE_IMPORTANCE = {
        # Top-tier conferences
        "STOC": 1,
        "FOCS": 1,
        "SODA": 2,
        "ICALP": 3,
        "STACS": 4,
        "ESA": 4,
        "APPROX": 4,
        "RANDOM": 4,
        # ML conferences
        "ICML": 1,
        "NeurIPS": 1,
        "NIPS": 1,
        "ICLR": 2,
        "AISTATS": 3,
        "UAI": 4,
        "COLT": 3,
        # Systems
        "OSDI": 1,
        "SOSP": 1,
        "NSDI": 2,
        "SIGCOMM": 2,
        # Theory journals
        "JACM": 1,
        "SICOMP": 1,
        "Algorithmica": 2,
        # Preprints (lowest priority)
        "arXiv": 100,
        "CoRR": 100,
    }

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.stats = {
            "files_processed": 0,
            "files_formatted": 0,
            "errors": 0,
            "backups_created": 0,
        }

    def clean_bibtex(self, bibtex: str) -> str:
        """Clean and format BibTeX entries."""
        if not bibtex:
            return bibtex

        # Remove escape sequences that YAML doesn't need
        cleaned = bibtex.replace("\\n", "\n").replace('\\"', '"')

        # Remove extra whitespace and normalize
        lines = []
        for line in cleaned.split("\n"):
            line = line.strip()
            if line:
                lines.append(line)

        # Reconstruct with proper indentation
        if lines:
            result = lines[0] + "\n"  # First line (usually @inproceedings{...)
            for line in lines[1:]:
                if line.startswith("}"):
                    result += line + "\n"
                else:
                    result += "  " + line + "\n"
            return result.rstrip() + "\n"

        return cleaned

    def clean_string_field(self, value: Any) -> Any:
        """Clean string fields of escape sequences."""
        if isinstance(value, str):
            # Remove YAML escape sequences
            cleaned = (
                value.replace("\\n", "\n").replace('\\"', '"').replace("\\\\", "\\")
            )
            return cleaned.strip()
        return value

    def sort_publications(self, publications: List[Dict]) -> List[Dict]:
        """Sort publications by importance (venues first, then arXiv)."""

        def get_sort_key(pub: Dict) -> tuple:
            name = pub.get("name", "").strip()

            # Get importance score (lower is more important)
            importance = self.VENUE_IMPORTANCE.get(name, 50)

            # Secondary sort by year (newer first)
            year = pub.get("year", 0) or 0

            return (importance, -year, name.lower())

        return sorted(publications, key=get_sort_key)

    def format_publication(self, pub: Dict) -> Dict:
        """Format a single publication entry."""
        formatted = {}

        # Add fields in standard order
        for field in self.PUBLICATION_FIELD_ORDER:
            if field in pub and pub[field] is not None:
                value = pub[field]

                if field == "bibtex":
                    value = self.clean_bibtex(value)
                else:
                    value = self.clean_string_field(value)

                # Only include non-empty values
                if value or value == 0:  # Allow year = 0 but not empty strings
                    formatted[field] = value

        return formatted

    def format_paper(self, paper_data: Dict) -> Dict:
        """Format a complete paper entry."""
        formatted = {}

        # Add fields in standard order
        for field in self.PAPER_FIELD_ORDER:
            if field in paper_data and paper_data[field] is not None:
                value = paper_data[field]

                if field == "publications":
                    # Format and sort publications
                    formatted_pubs = []
                    for pub in value:
                        if isinstance(pub, dict):
                            formatted_pub = self.format_publication(pub)
                            if formatted_pub:  # Only add non-empty publications
                                formatted_pubs.append(formatted_pub)

                    # Sort publications
                    if self.config.get("sort_publications", True):
                        formatted_pubs = self.sort_publications(formatted_pubs)

                    formatted[field] = formatted_pubs

                elif field == "labels":
                    # Sort labels alphabetically
                    if isinstance(value, list):
                        sorted_labels = sorted(
                            set(label.strip() for label in value if label.strip())
                        )
                        formatted[field] = sorted_labels
                    else:
                        formatted[field] = value

                else:
                    # Clean other string fields
                    formatted[field] = self.clean_string_field(value)

        return formatted

    def validate_paper(self, paper_data: Dict, file_path: Path) -> List[str]:
        """Validate paper data and return list of issues."""
        issues = []

        # Required fields
        if not paper_data.get("title"):
            issues.append("Missing or empty title")

        # Check publications
        publications = paper_data.get("publications", [])
        if not publications:
            issues.append("No publications found")
        else:
            for i, pub in enumerate(publications):
                if not isinstance(pub, dict):
                    issues.append(f"Publication {i+1} is not a dictionary")
                    continue

                if not pub.get("name"):
                    issues.append(f"Publication {i+1} missing name")

                # Check for suspicious years
                year = pub.get("year")
                if year and (year < 1950 or year > 2030):
                    issues.append(f"Publication {i+1} has suspicious year: {year}")

        return issues

    def load_yaml_file(self, file_path: Path) -> Optional[Dict]:
        """Load YAML file safely."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except yaml.YAMLError as e:
            logger.error(f"YAML parsing error in {file_path}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error reading {file_path}: {e}")
            return None

    def save_yaml_file(self, data: Dict, file_path: Path, backup: bool = True) -> bool:
        """Save YAML file with proper formatting."""
        try:
            if backup and file_path.exists():
                backup_path = file_path.with_suffix(".yml.bak")
                shutil.copy2(file_path, backup_path)
                self.stats["backups_created"] += 1

            with open(file_path, "w", encoding="utf-8") as f:
                # Use compatible YAML dump options
                yaml_options = {
                    "default_flow_style": False,
                    "allow_unicode": True,
                    "sort_keys": False,
                    "width": 120,
                    "indent": 2,
                }

                # Only add block_seq_indent if supported (newer PyYAML versions)
                try:
                    yaml.dump(data, f, **yaml_options, block_seq_indent=0)
                except TypeError:
                    # Fallback for older PyYAML versions
                    yaml.dump(data, f, **yaml_options)

            return True
        except Exception as e:
            logger.error(f"Error saving {file_path}: {e}")
            return False

    def format_file(self, file_path: Path, dry_run: bool = False) -> bool:
        """Format a single YAML file."""
        logger.info(f"Processing: {file_path.name}")

        # Load original data
        original_data = self.load_yaml_file(file_path)
        if original_data is None:
            self.stats["errors"] += 1
            return False

        # Validate
        issues = self.validate_paper(original_data, file_path)
        if issues:
            logger.warning(f"  Issues found in {file_path.name}:")
            for issue in issues:
                logger.warning(f"    - {issue}")

        # Format
        try:
            formatted_data = self.format_paper(original_data)
        except Exception as e:
            logger.error(f"  Error formatting {file_path.name}: {e}")
            self.stats["errors"] += 1
            return False

        # Check if changes are needed
        if formatted_data == original_data:
            logger.info(f"  ✓ No formatting needed")
            return True

        # Show changes in dry run mode
        if dry_run:
            logger.info(f"  📝 Would format {file_path.name}")
            self._show_changes(original_data, formatted_data)
            return True

        # Save formatted version
        if self.save_yaml_file(
            formatted_data, file_path, backup=self.config.get("create_backups", True)
        ):
            logger.info(f"  ✅ Formatted successfully")
            self.stats["files_formatted"] += 1
            return True
        else:
            self.stats["errors"] += 1
            return False

    def _show_changes(self, original: Dict, formatted: Dict):
        """Show what changes would be made (for dry run)."""
        changes = []

        # Check publications ordering
        orig_pubs = original.get("publications", [])
        form_pubs = formatted.get("publications", [])

        if orig_pubs != form_pubs and len(orig_pubs) == len(form_pubs):
            orig_names = [p.get("name", "") for p in orig_pubs]
            form_names = [p.get("name", "") for p in form_pubs]
            if orig_names != form_names:
                changes.append(f"    Reorder publications: {' → '.join(form_names)}")

        # Check for cleaned BibTeX
        for i, (orig_pub, form_pub) in enumerate(zip(orig_pubs, form_pubs)):
            orig_bib = orig_pub.get("bibtex", "")
            form_bib = form_pub.get("bibtex", "")
            if orig_bib != form_bib and orig_bib and form_bib:
                changes.append(f"    Clean BibTeX in publication {i+1}")

        if changes:
            for change in changes:
                logger.info(change)

    def format_directory(
        self, directory: Path, dry_run: bool = False, pattern: str = "*.yml"
    ) -> None:
        """Format all YAML files in a directory."""
        if not directory.exists():
            logger.error(f"Directory not found: {directory}")
            return

        yaml_files = list(directory.glob(pattern))
        if not yaml_files:
            logger.warning(f"No YAML files found in {directory}")
            return

        logger.info(f"Found {len(yaml_files)} YAML files")

        if dry_run:
            logger.info("🔍 DRY RUN MODE - No files will be modified")

        for file_path in sorted(yaml_files):
            self.stats["files_processed"] += 1
            try:
                self.format_file(file_path, dry_run=dry_run)
            except Exception as e:
                logger.error(f"Unexpected error processing {file_path}: {e}")
                self.stats["errors"] += 1

    def print_stats(self):
        """Print formatting statistics."""
        print("\n" + "=" * 60)
        print("📊 FORMATTING SUMMARY")
        print("=" * 60)
        print(f"Files processed: {self.stats['files_processed']}")
        print(f"Files formatted: {self.stats['files_formatted']}")
        print(f"Backups created: {self.stats['backups_created']}")
        print(f"Errors: {self.stats['errors']}")
        print("=" * 60)


def main():
    parser = argparse.ArgumentParser(description="Format YAML paper files consistently")
    parser.add_argument(
        "directory",
        type=Path,
        nargs="?",
        default=Path("papers"),
        help="Directory containing YAML files (default: papers)",
    )
    parser.add_argument(
        "--dry-run",
        "-n",
        action="store_true",
        help="Show what would be changed without modifying files",
    )
    parser.add_argument(
        "--pattern",
        "-p",
        default="*.yml",
        help="File pattern to match (default: *.yml)",
    )
    parser.add_argument(
        "--no-backup", action="store_true", help="Do not create backup files"
    )
    parser.add_argument(
        "--no-sort", action="store_true", help="Do not sort publications by importance"
    )
    parser.add_argument(
        "--verbose", "-v", action="store_true", help="Enable verbose logging"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    config = {
        "create_backups": not args.no_backup,
        "sort_publications": not args.no_sort,
    }

    logger.info("🚀 Starting YAML Paper Formatter")

    formatter = YAMLFormatter(config)
    formatter.format_directory(
        args.directory, dry_run=args.dry_run, pattern=args.pattern
    )

    formatter.print_stats()
    logger.info("✅ Formatting complete!")


if __name__ == "__main__":
    main()
