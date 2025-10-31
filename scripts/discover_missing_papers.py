#!/usr/bin/env python3
"""
Comprehensive Paper Discovery Tool for Learning-Augmented Algorithms

This script helps discover missing papers in the ALPS database using multiple approaches:
1. DBLP API queries for learning-augmented algorithms
2. ArXiv API searches with various keywords
3. Google Scholar scraping (with rate limiting)
4. Venue-specific searches (SODA, FOCS, STOC, ICALP, etc.)
5. Citation network analysis

Usage:
    python scripts/discover_missing_papers.py --method all
    python scripts/discover_missing_papers.py --method dblp
    python scripts/discover_missing_papers.py --method arxiv
    python scripts/discover_missing_papers.py --venue SODA --years 2020-2024
"""

import argparse
import json
import time
import re
import yaml
import requests
from datetime import datetime, timedelta
from pathlib import Path
import xml.etree.ElementTree as ET
from typing import List, Dict, Set, Optional
from dataclasses import dataclass
import urllib.parse


@dataclass
class Paper:
    title: str
    authors: List[str]
    year: int
    venue: str
    url: Optional[str] = None
    abstract: Optional[str] = None
    keywords: List[str] = None
    dblp_key: Optional[str] = None
    arxiv_id: Optional[str] = None


class PaperDiscovery:
    def __init__(self):
        self.existing_papers = self.load_existing_papers()
        self.session = requests.Session()
        self.session.headers.update(
            {"User-Agent": "ALPS-Discovery/1.0 (Academic Research)"}
        )

        # Keywords for learning-augmented algorithms
        self.keywords = [
            "learning-augmented",
            "learning augmented",
            "algorithms with predictions",
            "prediction-augmented",
            "machine-learned advice",
            "learning-assisted",
            "predictive algorithms",
            "advice complexity",
            "competitive analysis with predictions",
            "robust algorithms with predictions",
            "consistency competitive",
            "ML-augmented algorithms",
            "untrusted predictions",
            "learned optimization",
            "data-driven algorithms",
        ]

        # Relevant venues
        self.venues = {
            "SODA",
            "FOCS",
            "STOC",
            "ICALP",
            "ESA",
            "APPROX",
            "RANDOM",
            "ITCS",
            "WADS",
            "SWAT",
            "SPAA",
            "PODC",
            "DISC",
            "FSTTCS",
            "COCOON",
            "LATIN",
            "ISAAC",
            "WALCOM",
            "CCCG",
            "SoCG",
        }

        # Machine learning venues that might have algorithmic papers
        self.ml_venues = {
            "NIPS",
            "NeurIPS",
            "ICML",
            "ICLR",
            "AAAI",
            "IJCAI",
            "AISTATS",
            "UAI",
            "KDD",
            "COLT",
            "ALT",
        }

    def load_existing_papers(self) -> Set[str]:
        """Load titles of existing papers to avoid duplicates."""
        existing = set()
        papers_dir = Path("papers")

        if not papers_dir.exists():
            return existing

        for paper_file in papers_dir.glob("*.yml"):
            try:
                with open(paper_file, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                    if data and "title" in data:
                        # Normalize title for comparison
                        title = re.sub(r"[^\w\s]", "", data["title"].lower())
                        existing.add(title)
            except Exception as e:
                print(f"Warning: Could not parse {paper_file}: {e}")

        print(f"Loaded {len(existing)} existing papers")
        return existing

    def is_duplicate(self, title: str) -> bool:
        """Check if paper already exists in database."""
        normalized = re.sub(r"[^\w\s]", "", title.lower())
        return normalized in self.existing_papers

    def search_dblp(self, years: range = range(2018, 2026)) -> List[Paper]:
        """Search DBLP for learning-augmented algorithm papers."""
        papers = []

        for keyword in self.keywords[:5]:  # Limit to avoid too many requests
            print(f"Searching DBLP for: {keyword}")

            # DBLP search API
            url = "https://dblp.org/search/publ/api"
            params = {
                "q": keyword,
                "format": "xml",
                "h": "100",  # Max results per query
            }

            try:
                response = self.session.get(url, params=params, timeout=30)
                response.raise_for_status()

                # Parse XML response
                root = ET.fromstring(response.content)

                for hit in root.findall(".//hit"):
                    info = hit.find("info")
                    if info is None:
                        continue

                    title_elem = info.find("title")
                    year_elem = info.find("year")
                    venue_elem = info.find("venue")
                    authors_elem = info.findall("authors/author")
                    url_elem = info.find("url")

                    if title_elem is None or year_elem is None:
                        continue

                    title = title_elem.text
                    year = int(year_elem.text)

                    if year not in years or self.is_duplicate(title):
                        continue

                    authors = (
                        [author.text for author in authors_elem] if authors_elem else []
                    )
                    venue = venue_elem.text if venue_elem is not None else "Unknown"
                    url = url_elem.text if url_elem is not None else None

                    # Get DBLP key from URL
                    dblp_key = None
                    if url and "dblp.org" in url:
                        dblp_key = url.split("/")[-1]

                    paper = Paper(
                        title=title,
                        authors=authors,
                        year=year,
                        venue=venue,
                        url=url,
                        dblp_key=dblp_key,
                    )
                    papers.append(paper)

                time.sleep(1)  # Rate limiting

            except Exception as e:
                print(f"Error searching DBLP for '{keyword}': {e}")
                continue

        return papers

    def search_arxiv(self, years: range = range(2018, 2026)) -> List[Paper]:
        """Search ArXiv for learning-augmented algorithm papers."""
        papers = []

        for keyword in self.keywords:
            print(f"Searching ArXiv for: {keyword}")

            # ArXiv API search
            query = f'all:"{keyword}" AND cat:cs.DS'
            url = f"http://export.arxiv.org/api/query"
            params = {
                "search_query": query,
                "start": 0,
                "max_results": 100,
                "sortBy": "submittedDate",
                "sortOrder": "descending",
            }

            try:
                response = self.session.get(url, params=params, timeout=30)
                response.raise_for_status()

                # Parse Atom XML
                root = ET.fromstring(response.content)
                namespace = {"atom": "http://www.w3.org/2005/Atom"}

                for entry in root.findall(".//atom:entry", namespace):
                    title_elem = entry.find("atom:title", namespace)
                    published_elem = entry.find("atom:published", namespace)
                    authors_elems = entry.findall("atom:author/atom:name", namespace)
                    abstract_elem = entry.find("atom:summary", namespace)
                    id_elem = entry.find("atom:id", namespace)

                    if title_elem is None or published_elem is None:
                        continue

                    title = title_elem.text.strip()
                    published = published_elem.text
                    year = int(published[:4])

                    if year not in years or self.is_duplicate(title):
                        continue

                    authors = [author.text for author in authors_elems]
                    abstract = abstract_elem.text if abstract_elem is not None else None

                    # Extract ArXiv ID
                    arxiv_id = None
                    if id_elem is not None:
                        arxiv_url = id_elem.text
                        arxiv_id = arxiv_url.split("/")[-1]

                    paper = Paper(
                        title=title,
                        authors=authors,
                        year=year,
                        venue="arXiv",
                        url=arxiv_url,
                        abstract=abstract,
                        arxiv_id=arxiv_id,
                    )
                    papers.append(paper)

                time.sleep(1)  # Rate limiting

            except Exception as e:
                print(f"Error searching ArXiv for '{keyword}': {e}")
                continue

        return papers

    def search_venue_specific(self, venue: str, years: range) -> List[Paper]:
        """Search for papers in specific venues using DBLP."""
        papers = []

        for year in years:
            print(f"Searching {venue} {year}")

            # DBLP venue search
            venue_query = f"venue:{venue}: year:{year}:"
            url = "https://dblp.org/search/publ/api"
            params = {
                "q": venue_query,
                "format": "xml",
                "h": "1000",  # Get all papers from venue/year
            }

            try:
                response = self.session.get(url, params=params, timeout=30)
                response.raise_for_status()

                root = ET.fromstring(response.content)

                for hit in root.findall(".//hit"):
                    info = hit.find("info")
                    if info is None:
                        continue

                    title_elem = info.find("title")
                    if title_elem is None:
                        continue

                    title = title_elem.text

                    # Check if title contains learning-augmented keywords
                    title_lower = title.lower()
                    is_relevant = any(
                        keyword.lower() in title_lower for keyword in self.keywords
                    )

                    if not is_relevant or self.is_duplicate(title):
                        continue

                    authors_elem = info.findall("authors/author")
                    url_elem = info.find("url")

                    authors = (
                        [author.text for author in authors_elem] if authors_elem else []
                    )
                    url = url_elem.text if url_elem is not None else None

                    paper = Paper(
                        title=title, authors=authors, year=year, venue=venue, url=url
                    )
                    papers.append(paper)

                time.sleep(0.5)  # Rate limiting

            except Exception as e:
                print(f"Error searching {venue} {year}: {e}")
                continue

        return papers

    def analyze_citations(self, seed_papers: List[str]) -> List[Paper]:
        """Find papers through citation analysis (placeholder for future implementation)."""
        # This would require access to citation databases like Semantic Scholar API
        # For now, return empty list
        print("Citation analysis not yet implemented")
        return []

    def filter_relevant_papers(self, papers: List[Paper]) -> List[Paper]:
        """Filter papers to keep only those relevant to learning-augmented algorithms."""
        relevant = []

        for paper in papers:
            title_lower = paper.title.lower()
            abstract_lower = (paper.abstract or "").lower()

            # Check for relevance
            is_relevant = False

            # Strong indicators (learning-augmented specific)
            strong_keywords = [
                "learning-augmented",
                "learning augmented",
                "predictions",
                "advice complexity",
                "competitive analysis",
                "robust",
                "consistency",
                "untrusted predictions",
            ]

            if any(keyword in title_lower for keyword in strong_keywords):
                is_relevant = True
            elif any(keyword in abstract_lower for keyword in strong_keywords):
                is_relevant = True

            # Weak indicators (require additional context)
            if not is_relevant:
                weak_keywords = ["learning", "ml", "machine learning", "data-driven"]
                algo_keywords = ["algorithm", "online", "competitive", "approximation"]

                has_weak = any(keyword in title_lower for keyword in weak_keywords)
                has_algo = any(keyword in title_lower for keyword in algo_keywords)

                if has_weak and has_algo:
                    is_relevant = True

            if is_relevant:
                relevant.append(paper)

        return relevant

    def save_results(self, papers: List[Paper], filename: str):
        """Save discovered papers to file."""
        results = {
            "discovered_at": datetime.now().isoformat(),
            "total_papers": len(papers),
            "papers": [],
        }

        for paper in papers:
            paper_data = {
                "title": paper.title,
                "authors": paper.authors,
                "year": paper.year,
                "venue": paper.venue,
                "url": paper.url,
                "dblp_key": paper.dblp_key,
                "arxiv_id": paper.arxiv_id,
            }
            if paper.abstract:
                paper_data["abstract"] = (
                    paper.abstract[:500] + "..."
                    if len(paper.abstract) > 500
                    else paper.abstract
                )

            results["papers"].append(paper_data)

        with open(filename, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print(f"Saved {len(papers)} discovered papers to {filename}")


def main():
    parser = argparse.ArgumentParser(
        description="Discover missing papers in ALPS database"
    )
    parser.add_argument(
        "--method",
        choices=["all", "dblp", "arxiv", "venues"],
        default="all",
        help="Search method to use",
    )
    parser.add_argument("--venue", help="Specific venue to search (for venues method)")
    parser.add_argument(
        "--years", default="2020-2024", help="Year range (e.g., 2020-2024)"
    )
    parser.add_argument(
        "--output", default="discovered_papers.json", help="Output filename"
    )

    args = parser.parse_args()

    # Parse year range
    year_parts = args.years.split("-")
    if len(year_parts) == 2:
        start_year, end_year = int(year_parts[0]), int(year_parts[1])
        years = range(start_year, end_year + 1)
    else:
        years = range(2020, 2025)  # Default

    discovery = PaperDiscovery()
    all_papers = []

    if args.method in ["all", "dblp"]:
        print("=== Searching DBLP ===")
        dblp_papers = discovery.search_dblp(years)
        all_papers.extend(dblp_papers)
        print(f"Found {len(dblp_papers)} papers from DBLP")

    if args.method in ["all", "arxiv"]:
        print("=== Searching ArXiv ===")
        arxiv_papers = discovery.search_arxiv(years)
        all_papers.extend(arxiv_papers)
        print(f"Found {len(arxiv_papers)} papers from ArXiv")

    if args.method in ["all", "venues"]:
        print("=== Searching Specific Venues ===")
        venues_to_search = [args.venue] if args.venue else discovery.venues

        for venue in venues_to_search:
            venue_papers = discovery.search_venue_specific(venue, years)
            all_papers.extend(venue_papers)
            print(f"Found {len(venue_papers)} papers from {venue}")

    # Remove duplicates and filter for relevance
    print("=== Filtering and deduplicating ===")
    unique_papers = []
    seen_titles = set()

    for paper in all_papers:
        normalized_title = re.sub(r"[^\w\s]", "", paper.title.lower())
        if normalized_title not in seen_titles:
            seen_titles.add(normalized_title)
            unique_papers.append(paper)

    relevant_papers = discovery.filter_relevant_papers(unique_papers)

    print(f"\nSummary:")
    print(f"Total papers found: {len(all_papers)}")
    print(f"After deduplication: {len(unique_papers)}")
    print(f"After relevance filtering: {len(relevant_papers)}")

    # Save results
    discovery.save_results(relevant_papers, args.output)

    # Print some examples
    print(f"\nExample discoveries:")
    for i, paper in enumerate(relevant_papers[:5]):
        print(f"{i+1}. {paper.title} ({paper.year}, {paper.venue})")
        print(
            f"   Authors: {', '.join(paper.authors[:3])}{'...' if len(paper.authors) > 3 else ''}"
        )
        print()


if __name__ == "__main__":
    main()
