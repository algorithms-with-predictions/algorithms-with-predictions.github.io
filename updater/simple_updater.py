#!/usr/bin/env python3
"""
Simple Paper Updater - No External Dependencies
=============================================

A simplified version of the paper updater that only uses Python standard library.
This version works without needing to install any external packages.
"""

import argparse
import json
import logging
import re
import shutil
import sys
import time
import urllib.request
import urllib.parse
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import xml.etree.ElementTree as ET
from difflib import SequenceMatcher


# Simple YAML parser (basic subset)
class SimpleYAML:
    @staticmethod
    def load(file_obj):
        """Simple YAML loader for basic structures"""
        content = file_obj.read()
        return SimpleYAML.parse(content)

    @staticmethod
    def parse(content: str) -> dict:
        """Parse basic YAML structure"""
        result = {}
        current_key = None
        in_list = False
        current_list = []

        for line in content.split("\n"):
            line = line.strip()
            if not line or line.startswith("#"):
                continue

            if line.startswith("- ") and in_list:
                # List item
                item = line[2:].strip()
                if item.startswith("name:"):
                    # Publication item
                    pub = {"name": item.split(":", 1)[1].strip()}
                    current_list.append(pub)
                else:
                    current_list.append(item)
            elif ":" in line and not line.startswith(" "):
                # Top-level key
                if current_key and in_list:
                    result[current_key] = current_list

                key, value = line.split(":", 1)
                key = key.strip()
                value = value.strip()

                if not value:
                    # Start of list or nested structure
                    current_key = key
                    current_list = []
                    in_list = True
                else:
                    # Simple key-value
                    result[key] = value
                    in_list = False
            elif line.startswith("  ") and in_list:
                # Nested item in current publication
                if current_list and isinstance(current_list[-1], dict):
                    nested_line = line.strip()
                    if ":" in nested_line:
                        nest_key, nest_value = nested_line.split(":", 1)
                        nest_key = nest_key.strip()
                        nest_value = nest_value.strip()
                        if nest_value and nest_value != "null":
                            current_list[-1][nest_key] = nest_value

        if current_key and in_list:
            result[current_key] = current_list

        return result

    @staticmethod
    def dump(data: dict, file_obj):
        """Simple YAML dumper"""
        content = SimpleYAML.to_yaml(data)
        file_obj.write(content)

    @staticmethod
    def to_yaml(data: dict, indent=0) -> str:
        """Convert dict to YAML string"""
        result = []
        spaces = "  " * indent

        for key, value in data.items():
            if isinstance(value, list):
                result.append(f"{spaces}{key}:")
                for item in value:
                    if isinstance(item, dict):
                        result.append(f"{spaces}- name: {item.get('name', '')}")
                        for sub_key, sub_value in item.items():
                            if sub_key != "name" and sub_value is not None:
                                if isinstance(sub_value, int):
                                    result.append(f"{spaces}  {sub_key}: {sub_value}")
                                else:
                                    result.append(f"{spaces}  {sub_key}: {sub_value}")
                    else:
                        result.append(f"{spaces}- {item}")
            elif isinstance(value, str):
                result.append(f"{spaces}{key}: {value}")
            elif value is not None:
                result.append(f"{spaces}{key}: {value}")

        return "\n".join(result) + "\n"


# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class Paper:
    def __init__(
        self,
        title: str,
        authors: Optional[str] = None,
        labels: List[str] = None,
        publications: List[Dict] = None,
    ):
        self.title = title
        self.authors = authors
        self.labels = labels or []
        self.publications = publications or []


class UpdateStats:
    def __init__(self):
        self.papers_processed = 0
        self.arxiv_updates = 0
        self.dblp_updates = 0
        self.errors = 0
        self.new_publications = 0
        self.skipped_papers = 0

    def print_summary(self):
        print("\n" + "=" * 50)
        print("📊 UPDATE SUMMARY")
        print("=" * 50)
        print(f"Papers processed: {self.papers_processed}")
        print(f"ArXiv updates: {self.arxiv_updates}")
        print(f"DBLP updates: {self.dblp_updates}")
        print(f"New publications: {self.new_publications}")
        print(f"Errors: {self.errors}")
        print(f"Skipped: {self.skipped_papers}")
        print("=" * 50)


class SimilarityMatcher:
    @staticmethod
    def normalize_title(title: str) -> str:
        """Normalize title for comparison."""
        normalized = re.sub(r"[^\w\s]", " ", title.lower())
        normalized = " ".join(normalized.split())
        return normalized.strip()

    @staticmethod
    def jaccard_similarity(s1: str, s2: str) -> float:
        """Calculate Jaccard similarity between two strings."""
        tokens1 = set(SimilarityMatcher.normalize_title(s1).split())
        tokens2 = set(SimilarityMatcher.normalize_title(s2).split())

        if not tokens1 and not tokens2:
            return 1.0
        if not tokens1 or not tokens2:
            return 0.0

        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        return len(intersection) / len(union)

    @staticmethod
    def combined_similarity(s1: str, s2: str) -> float:
        """Calculate combined similarity score."""
        jaccard = SimilarityMatcher.jaccard_similarity(s1, s2)
        sequence = SequenceMatcher(
            None,
            SimilarityMatcher.normalize_title(s1),
            SimilarityMatcher.normalize_title(s2),
        ).ratio()

        return 0.6 * jaccard + 0.4 * sequence


class SimplePaperUpdater:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.stats = UpdateStats()

    def load_paper(self, file_path: Path) -> Optional[Paper]:
        """Load paper from YAML file."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = SimpleYAML.load(f)

            return Paper(
                title=data.get("title", ""),
                authors=data.get("authors"),
                labels=data.get("labels", []),
                publications=data.get("publications", []),
            )
        except Exception as e:
            logger.error(f"Error loading {file_path}: {e}")
            return None

    def save_paper(self, paper: Paper, file_path: Path, backup: bool = True) -> bool:
        """Save paper to YAML file with optional backup."""
        try:
            if backup and file_path.exists():
                backup_path = file_path.with_suffix(".yml.bak")
                shutil.copy2(file_path, backup_path)

            # Convert to dict for YAML serialization
            data = {
                "title": paper.title,
                "authors": paper.authors,
                "labels": paper.labels,
                "publications": paper.publications,
            }

            with open(file_path, "w", encoding="utf-8") as f:
                SimpleYAML.dump(data, f)

            return True
        except Exception as e:
            logger.error(f"Error saving {file_path}: {e}")
            return False

    def fetch_url(self, url: str, timeout: int = 30) -> Optional[str]:
        """Fetch URL content with timeout."""
        try:
            req = urllib.request.Request(url)
            req.add_header("User-Agent", "Enhanced-Paper-Updater/1.0")

            with urllib.request.urlopen(req, timeout=timeout) as response:
                return response.read().decode("utf-8")
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None

    def update_from_arxiv(self, paper: Paper) -> bool:
        """Update paper information from arXiv."""
        try:
            query = urllib.parse.quote_plus(paper.title.replace("-", " "))
            url = (
                f"http://export.arxiv.org/api/query?max_results=20&search_query={query}"
            )

            xml_content = self.fetch_url(url)
            if not xml_content:
                return False

            root = ET.fromstring(xml_content)
            ns = {"atom": "http://www.w3.org/2005/Atom"}
            entries = root.findall("atom:entry", ns)

            for entry in entries:
                title_elem = entry.find("atom:title", ns)
                if title_elem is None:
                    continue

                entry_title = title_elem.text.strip()
                similarity = SimilarityMatcher.combined_similarity(
                    paper.title, entry_title
                )

                if similarity >= self.config.get("arxiv_threshold", 0.7):
                    return self._process_arxiv_entry(paper, entry, ns)

            return False

        except Exception as e:
            logger.error(f"ArXiv update error for '{paper.title}': {e}")
            return False

    def _process_arxiv_entry(self, paper: Paper, entry: ET.Element, ns: dict) -> bool:
        """Process a matching arXiv entry."""
        updated = False

        try:
            # Update authors if missing
            if not paper.authors:
                authors = []
                for author in entry.findall("atom:author", ns):
                    name_elem = author.find("atom:name", ns)
                    if name_elem is not None:
                        authors.append(name_elem.text.strip())

                if authors:
                    last_names = [name.split()[-1] for name in authors]
                    paper.authors = ", ".join(last_names)
                    logger.info(f"  ✓ Updated authors from arXiv")
                    updated = True

            # Get publication details
            published_elem = entry.find("atom:published", ns)
            id_elem = entry.find("atom:id", ns)

            if published_elem is not None and id_elem is not None:
                pub_date = datetime.fromisoformat(
                    published_elem.text.replace("Z", "+00:00")
                )

                arxiv_url = id_elem.text.strip()
                arxiv_url = re.sub(r"v\d+$", "", arxiv_url)
                arxiv_url = arxiv_url.replace("http://", "https://")

                # Check if arXiv publication exists
                arxiv_pub = None
                for pub in paper.publications:
                    if pub.get("name") == "arXiv":
                        arxiv_pub = pub
                        break

                if arxiv_pub:
                    if arxiv_pub.get("url") != arxiv_url:
                        arxiv_pub["url"] = arxiv_url
                        arxiv_pub["year"] = pub_date.year
                        arxiv_pub["month"] = pub_date.month
                        arxiv_pub["day"] = pub_date.day
                        logger.info(f"  ✓ Updated arXiv publication")
                        updated = True
                else:
                    paper.publications.append(
                        {
                            "name": "arXiv",
                            "url": arxiv_url,
                            "year": pub_date.year,
                            "month": pub_date.month,
                            "day": pub_date.day,
                        }
                    )
                    logger.info(f"  ✓ Added arXiv publication")
                    self.stats.new_publications += 1
                    updated = True

        except Exception as e:
            logger.error(f"Error processing arXiv entry: {e}")

        return updated

    def update_from_dblp(self, paper: Paper) -> bool:
        """Update paper information from DBLP."""
        try:
            query = urllib.parse.quote_plus(paper.title.replace("-", " "))
            url = f"https://dblp.org/search/publ/api?h=20&q={query}"

            xml_content = self.fetch_url(url)
            if not xml_content:
                return False

            root = ET.fromstring(xml_content)
            hits = root.findall(".//hit")

            for hit in hits:
                title_elem = hit.find(".//title")
                if title_elem is None:
                    continue

                entry_title = title_elem.text
                similarity = SimilarityMatcher.combined_similarity(
                    paper.title, entry_title
                )

                if similarity >= self.config.get("dblp_threshold", 0.6):
                    return self._process_dblp_hit(paper, hit)

            return False

        except Exception as e:
            logger.error(f"DBLP update error for '{paper.title}': {e}")
            return False

    def _process_dblp_hit(self, paper: Paper, hit: ET.Element) -> bool:
        """Process a matching DBLP hit."""
        updated = False

        try:
            venue_elem = hit.find(".//venue")
            if venue_elem is None or venue_elem.text == "CoRR":
                return False

            venue = venue_elem.text

            # Update authors if missing
            if not paper.authors:
                authors = [elem.text for elem in hit.findall(".//author")]
                if authors:
                    last_names = [name.split()[-1] for name in authors]
                    paper.authors = ", ".join(last_names)
                    logger.info(f"  ✓ Updated authors from DBLP")
                    updated = True

            # Get publication details
            year_elem = hit.find(".//year")
            key_elem = hit.find(".//key")
            ee_elem = hit.find(".//ee")

            year = int(year_elem.text) if year_elem is not None else None
            dblp_key = key_elem.text if key_elem is not None else None
            url = ee_elem.text if ee_elem is not None else None

            # Fetch BibTeX if we have a key
            bibtex = None
            if dblp_key:
                bibtex_url = f"https://dblp.org/rec/{dblp_key}.bib?param=0"
                bibtex = self.fetch_url(bibtex_url)

            # Check if publication exists
            existing_pub = None
            for pub in paper.publications:
                if pub.get("name", "").lower() == venue.lower():
                    existing_pub = pub
                    break

            if existing_pub:
                pub_updated = False
                if not existing_pub.get("dblp_key") and dblp_key:
                    existing_pub["dblp_key"] = dblp_key
                    pub_updated = True
                if not existing_pub.get("bibtex") and bibtex:
                    existing_pub["bibtex"] = bibtex
                    pub_updated = True
                if not existing_pub.get("url") and url:
                    existing_pub["url"] = url
                    pub_updated = True

                if pub_updated:
                    logger.info(f"  ✓ Updated {venue} publication details")
                    updated = True
            else:
                new_pub = {"name": venue}
                if url:
                    new_pub["url"] = url
                if year:
                    new_pub["year"] = year
                if dblp_key:
                    new_pub["dblp_key"] = dblp_key
                if bibtex:
                    new_pub["bibtex"] = bibtex

                paper.publications.append(new_pub)
                logger.info(f"  ✓ Added {venue} publication")
                self.stats.new_publications += 1
                updated = True

        except Exception as e:
            logger.error(f"Error processing DBLP hit: {e}")

        return updated

    def update_paper(self, paper: Paper) -> bool:
        """Update a single paper from all sources."""
        logger.info(f"📄 Updating: {paper.title}")

        updated = False

        # Update from arXiv
        try:
            if self.update_from_arxiv(paper):
                self.stats.arxiv_updates += 1
                updated = True
        except Exception as e:
            logger.error(f"arXiv error: {e}")
            self.stats.errors += 1

        # Update from DBLP
        try:
            if self.update_from_dblp(paper):
                self.stats.dblp_updates += 1
                updated = True
        except Exception as e:
            logger.error(f"DBLP error: {e}")
            self.stats.errors += 1

        return updated

    def process_papers(
        self, papers_dir: Path, dry_run: bool = False, max_papers: Optional[int] = None
    ) -> None:
        """Process all papers in the directory."""

        # Load all papers
        paper_files = list(papers_dir.glob("*.yml"))
        if max_papers:
            paper_files = paper_files[:max_papers]

        logger.info(f"📂 Found {len(paper_files)} paper files")

        # Load and sort papers by publication count
        papers_with_paths = []
        for file_path in paper_files:
            paper = self.load_paper(file_path)
            if paper:
                papers_with_paths.append((file_path, paper))
            else:
                self.stats.errors += 1

        # Sort by publication count
        papers_with_paths.sort(key=lambda x: len(x[1].publications))

        logger.info(f"📋 Loaded {len(papers_with_paths)} valid papers")

        # Process papers
        for i, (file_path, paper) in enumerate(papers_with_paths, 1):
            self.stats.papers_processed += 1

            logger.info(
                f"\n[{i}/{len(papers_with_paths)}] Processing: {file_path.name}"
            )

            if dry_run:
                logger.info("  🔍 DRY RUN - would update paper")
                continue

            try:
                updated = self.update_paper(paper)

                if updated:
                    if self.save_paper(paper, file_path):
                        logger.info(f"  ✅ Saved updates to {file_path.name}")
                    else:
                        logger.error(f"  ❌ Failed to save {file_path.name}")
                        self.stats.errors += 1
                else:
                    logger.info(f"  ⏭️  No updates needed for {file_path.name}")
                    self.stats.skipped_papers += 1

                # Rate limiting
                time.sleep(self.config.get("delay_seconds", 1.5))

            except Exception as e:
                logger.error(f"  ❌ Error processing {file_path.name}: {e}")
                self.stats.errors += 1


def main():
    parser = argparse.ArgumentParser(
        description="Simple Academic Paper Updater (No External Dependencies)"
    )
    parser.add_argument(
        "--papers-dir",
        "-d",
        type=Path,
        default=Path("../papers"),
        help="Directory containing paper YAML files",
    )
    parser.add_argument(
        "--dry-run",
        "-n",
        action="store_true",
        help="Show what would be updated without making changes",
    )
    parser.add_argument(
        "--max-papers", "-m", type=int, help="Maximum number of papers to process"
    )
    parser.add_argument(
        "--verbose", "-v", action="store_true", help="Enable verbose logging"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    if not args.papers_dir.exists():
        logger.error(f"Papers directory not found: {args.papers_dir}")
        sys.exit(1)

    # Simple configuration
    config = {
        "arxiv_threshold": 0.7,
        "dblp_threshold": 0.6,
        "delay_seconds": 1.5,
    }

    logger.info("🚀 Starting Simple Paper Updater (No Dependencies)")

    updater = SimplePaperUpdater(config)
    updater.process_papers(
        args.papers_dir, dry_run=args.dry_run, max_papers=args.max_papers
    )
    updater.stats.print_summary()

    logger.info("✅ Update process completed!")


if __name__ == "__main__":
    main()
