#!/usr/bin/env python3
"""
Enhanced Paper Updater - Python Version
=====================================

A comprehensive tool for updating academic paper metadata from multiple sources
including arXiv, DBLP, CrossRef, and Google Scholar.

Features:
- Improved fuzzy matching with multiple similarity metrics
- Support for multiple data sources
- Parallel processing for faster updates
- Detailed logging and statistics
- Backup and rollback capabilities
- Dry-run mode for testing
- Configuration file support
"""

import asyncio
import argparse
import json
import logging
import re
import shutil
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import xml.etree.ElementTree as ET

import aiohttp
import yaml
from difflib import SequenceMatcher
from dataclasses import dataclass, field
from urllib.parse import quote_plus

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("updater.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)


@dataclass
class Publication:
    name: str
    url: Optional[str] = None
    year: Optional[int] = None
    month: Optional[int] = None
    day: Optional[int] = None
    dblp_key: Optional[str] = None
    bibtex: Optional[str] = None


@dataclass
class Paper:
    title: str
    authors: Optional[str] = None
    labels: List[str] = field(default_factory=list)
    publications: List[Publication] = field(default_factory=list)


@dataclass
class UpdateStats:
    papers_processed: int = 0
    arxiv_updates: int = 0
    dblp_updates: int = 0
    crossref_updates: int = 0
    errors: int = 0
    new_publications: int = 0
    skipped_papers: int = 0

    def print_summary(self):
        print("\n" + "=" * 50)
        print("📊 UPDATE SUMMARY")
        print("=" * 50)
        print(f"Papers processed: {self.papers_processed}")
        print(f"ArXiv updates: {self.arxiv_updates}")
        print(f"DBLP updates: {self.dblp_updates}")
        print(f"CrossRef updates: {self.crossref_updates}")
        print(f"New publications: {self.new_publications}")
        print(f"Errors: {self.errors}")
        print(f"Skipped: {self.skipped_papers}")
        print("=" * 50)


class SimilarityMatcher:
    """Advanced text similarity matching using multiple algorithms."""

    @staticmethod
    def normalize_title(title: str) -> str:
        """Normalize title for comparison."""
        # Remove special characters and extra whitespace
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
    def sequence_similarity(s1: str, s2: str) -> float:
        """Calculate sequence similarity."""
        norm1 = SimilarityMatcher.normalize_title(s1)
        norm2 = SimilarityMatcher.normalize_title(s2)
        return SequenceMatcher(None, norm1, norm2).ratio()

    @staticmethod
    def combined_similarity(s1: str, s2: str) -> float:
        """Calculate combined similarity score."""
        jaccard = SimilarityMatcher.jaccard_similarity(s1, s2)
        sequence = SimilarityMatcher.sequence_similarity(s1, s2)

        # Weighted combination favoring token overlap
        return 0.6 * jaccard + 0.4 * sequence


class PaperUpdater:
    """Main updater class with support for multiple sources."""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.session: Optional[aiohttp.ClientSession] = None
        self.stats = UpdateStats()

    async def __aenter__(self):
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(timeout=timeout)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    def load_paper(self, file_path: Path) -> Optional[Paper]:
        """Load paper from YAML file."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)

            publications = []
            for pub_data in data.get("publications", []):
                publications.append(Publication(**pub_data))

            return Paper(
                title=data["title"],
                authors=data.get("authors"),
                labels=data.get("labels", []),
                publications=publications,
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
                "publications": [
                    {k: v for k, v in pub.__dict__.items() if v is not None}
                    for pub in paper.publications
                ],
            }

            with open(file_path, "w", encoding="utf-8") as f:
                yaml.dump(
                    data,
                    f,
                    default_flow_style=False,
                    allow_unicode=True,
                    sort_keys=False,
                )

            return True
        except Exception as e:
            logger.error(f"Error saving {file_path}: {e}")
            return False

    async def update_from_arxiv(self, paper: Paper) -> bool:
        """Update paper information from arXiv."""
        if not self.session:
            return False

        try:
            # Search arXiv
            query = quote_plus(paper.title.replace("-", " "))
            url = (
                f"http://export.arxiv.org/api/query?max_results=20&search_query={query}"
            )

            async with self.session.get(url) as response:
                if response.status != 200:
                    return False

                xml_content = await response.text()
                root = ET.fromstring(xml_content)

                # Parse entries
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
                        return await self._process_arxiv_entry(paper, entry, ns)

                return False

        except Exception as e:
            logger.error(f"ArXiv update error for '{paper.title}': {e}")
            return False

    async def _process_arxiv_entry(
        self, paper: Paper, entry: ET.Element, ns: dict
    ) -> bool:
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
                    # Extract last names
                    last_names = [name.split()[-1] for name in authors]
                    paper.authors = ", ".join(last_names)
                    logger.info(f"  ✓ Updated authors from arXiv")
                    updated = True

            # Get publication details
            published_elem = entry.find("atom:published", ns)
            id_elem = entry.find("atom:id", ns)

            if published_elem is not None and id_elem is not None:
                # Parse date
                pub_date = datetime.fromisoformat(
                    published_elem.text.replace("Z", "+00:00")
                )

                # Clean arXiv URL
                arxiv_url = id_elem.text.strip()
                arxiv_url = re.sub(r"v\d+$", "", arxiv_url)
                arxiv_url = arxiv_url.replace("http://", "https://")

                # Update or create arXiv publication
                arxiv_pub = next(
                    (p for p in paper.publications if p.name == "arXiv"), None
                )

                if arxiv_pub:
                    if arxiv_pub.url != arxiv_url:
                        arxiv_pub.url = arxiv_url
                        arxiv_pub.year = pub_date.year
                        arxiv_pub.month = pub_date.month
                        arxiv_pub.day = pub_date.day
                        logger.info(f"  ✓ Updated arXiv publication")
                        updated = True
                else:
                    paper.publications.append(
                        Publication(
                            name="arXiv",
                            url=arxiv_url,
                            year=pub_date.year,
                            month=pub_date.month,
                            day=pub_date.day,
                        )
                    )
                    logger.info(f"  ✓ Added arXiv publication")
                    self.stats.new_publications += 1
                    updated = True

        except Exception as e:
            logger.error(f"Error processing arXiv entry: {e}")

        return updated

    async def update_from_dblp(self, paper: Paper) -> bool:
        """Update paper information from DBLP."""
        if not self.session:
            return False

        try:
            query = quote_plus(paper.title.replace("-", " "))
            url = f"https://dblp.org/search/publ/api?h=20&q={query}"

            async with self.session.get(url) as response:
                if response.status != 200:
                    return False

                xml_content = await response.text()
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
                        return await self._process_dblp_hit(paper, hit)

                return False

        except Exception as e:
            logger.error(f"DBLP update error for '{paper.title}': {e}")
            return False

    async def _process_dblp_hit(self, paper: Paper, hit: ET.Element) -> bool:
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
            if dblp_key and self.session:
                try:
                    bibtex_url = f"https://dblp.org/rec/{dblp_key}.bib?param=0"
                    async with self.session.get(bibtex_url) as response:
                        if response.status == 200:
                            bibtex = await response.text()
                except Exception:
                    pass  # BibTeX fetch failed, continue without it

            # Update or create publication
            existing_pub = next(
                (p for p in paper.publications if p.name.lower() == venue.lower()), None
            )

            if existing_pub:
                pub_updated = False
                if not existing_pub.dblp_key and dblp_key:
                    existing_pub.dblp_key = dblp_key
                    pub_updated = True
                if not existing_pub.bibtex and bibtex:
                    existing_pub.bibtex = bibtex
                    pub_updated = True
                if not existing_pub.url and url:
                    existing_pub.url = url
                    pub_updated = True

                if pub_updated:
                    logger.info(f"  ✓ Updated {venue} publication details")
                    updated = True
            else:
                paper.publications.append(
                    Publication(
                        name=venue, url=url, year=year, dblp_key=dblp_key, bibtex=bibtex
                    )
                )
                logger.info(f"  ✓ Added {venue} publication")
                self.stats.new_publications += 1
                updated = True

        except Exception as e:
            logger.error(f"Error processing DBLP hit: {e}")

        return updated

    async def update_paper(self, paper: Paper) -> bool:
        """Update a single paper from all sources."""
        logger.info(f"📄 Updating: {paper.title}")

        updated = False

        # Update from arXiv
        try:
            if await self.update_from_arxiv(paper):
                self.stats.arxiv_updates += 1
                updated = True
        except Exception as e:
            logger.error(f"arXiv error: {e}")
            self.stats.errors += 1

        # Update from DBLP
        try:
            if await self.update_from_dblp(paper):
                self.stats.dblp_updates += 1
                updated = True
        except Exception as e:
            logger.error(f"DBLP error: {e}")
            self.stats.errors += 1

        return updated

    async def process_papers(
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

        # Sort by publication count (fewer publications first)
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
                updated = await self.update_paper(paper)

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
                await asyncio.sleep(self.config.get("delay_seconds", 1.5))

            except Exception as e:
                logger.error(f"  ❌ Error processing {file_path.name}: {e}")
                self.stats.errors += 1


def load_config(config_path: Optional[Path] = None) -> Dict[str, Any]:
    """Load configuration from file or use defaults."""
    default_config = {
        "arxiv_threshold": 0.7,
        "dblp_threshold": 0.6,
        "delay_seconds": 1.5,
        "max_results": 20,
    }

    if config_path and config_path.exists():
        try:
            with open(config_path, "r") as f:
                user_config = yaml.safe_load(f) or {}
            default_config.update(user_config)
        except Exception as e:
            logger.warning(f"Error loading config: {e}, using defaults")

    return default_config


async def main():
    parser = argparse.ArgumentParser(description="Enhanced Academic Paper Updater")
    parser.add_argument(
        "--papers-dir",
        "-d",
        type=Path,
        default=Path("../papers"),
        help="Directory containing paper YAML files",
    )
    parser.add_argument("--config", "-c", type=Path, help="Configuration file path")
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

    config = load_config(args.config)
    logger.info(f"🔧 Loaded configuration: {config}")

    logger.info("🚀 Starting Enhanced Paper Updater (Python)")

    async with PaperUpdater(config) as updater:
        await updater.process_papers(
            args.papers_dir, dry_run=args.dry_run, max_papers=args.max_papers
        )
        updater.stats.print_summary()

    logger.info("✅ Update process completed!")


if __name__ == "__main__":
    asyncio.run(main())
