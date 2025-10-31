#!/usr/bin/env python3
"""
Quick Paper Discovery Script for ALPS

A simplified version that searches for learning-augmented algorithm papers
using DBLP and ArXiv APIs with minimal dependencies.

Usage: python scripts/quick_paper_search.py
"""

import requests
import json
import xml.etree.ElementTree as ET
import time
from datetime import datetime
import re
import sys
from pathlib import Path


def load_existing_titles():
    """Load existing paper titles to avoid duplicates."""
    existing = set()
    papers_dir = Path("papers")

    if papers_dir.exists():
        # Just count files for now - could parse YAML if pyyaml available
        existing_count = len(list(papers_dir.glob("*.yml")))
        print(f"Found {existing_count} existing paper files")

    return existing


def search_dblp_simple():
    """Simple DBLP search for learning-augmented papers."""
    papers = []
    keywords = [
        "learning-augmented",
        "learning augmented",
        "algorithms with predictions",
        "competitive analysis with predictions",
        "untrusted predictions",
    ]

    for keyword in keywords:
        print(f"Searching DBLP for: '{keyword}'")

        url = "https://dblp.org/search/publ/api"
        params = {"q": keyword, "format": "xml", "h": "50"}

        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()

            root = ET.fromstring(response.content)

            for hit in root.findall(".//hit"):
                info = hit.find("info")
                if info is None:
                    continue

                title_elem = info.find("title")
                year_elem = info.find("year")
                venue_elem = info.find("venue")
                authors_elems = info.findall("authors/author")
                url_elem = info.find("url")

                if title_elem is None or year_elem is None:
                    continue

                title = title_elem.text
                year = int(year_elem.text)
                venue = venue_elem.text if venue_elem is not None else "Unknown"
                authors = [author.text for author in authors_elems]
                paper_url = url_elem.text if url_elem is not None else None

                # Filter for recent papers (2018+)
                if year >= 2018:
                    papers.append(
                        {
                            "title": title,
                            "authors": authors,
                            "year": year,
                            "venue": venue,
                            "url": paper_url,
                            "source": "DBLP",
                            "search_term": keyword,
                        }
                    )

            time.sleep(1)  # Rate limiting

        except Exception as e:
            print(f"Error searching DBLP for '{keyword}': {e}")

    return papers


def search_arxiv_simple():
    """Simple ArXiv search for learning-augmented papers."""
    papers = []
    keywords = [
        "learning-augmented algorithms",
        "algorithms with predictions",
        "competitive analysis predictions",
    ]

    for keyword in keywords:
        print(f"Searching ArXiv for: '{keyword}'")

        query = f'all:"{keyword}"'
        url = "http://export.arxiv.org/api/query"
        params = {
            "search_query": query,
            "start": 0,
            "max_results": 50,
            "sortBy": "submittedDate",
            "sortOrder": "descending",
        }

        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()

            root = ET.fromstring(response.content)
            namespace = {"atom": "http://www.w3.org/2005/Atom"}

            for entry in root.findall(".//atom:entry", namespace):
                title_elem = entry.find("atom:title", namespace)
                published_elem = entry.find("atom:published", namespace)
                authors_elems = entry.findall("atom:author/atom:name", namespace)
                id_elem = entry.find("atom:id", namespace)

                if title_elem is None or published_elem is None:
                    continue

                title = title_elem.text.strip()
                published = published_elem.text
                year = int(published[:4])
                authors = [author.text for author in authors_elems]
                arxiv_url = id_elem.text if id_elem is not None else None

                # Filter for recent papers
                if year >= 2018:
                    papers.append(
                        {
                            "title": title,
                            "authors": authors,
                            "year": year,
                            "venue": "arXiv",
                            "url": arxiv_url,
                            "source": "ArXiv",
                            "search_term": keyword,
                        }
                    )

            time.sleep(1)  # Rate limiting

        except Exception as e:
            print(f"Error searching ArXiv for '{keyword}': {e}")

    return papers


def remove_duplicates(papers):
    """Remove duplicate papers based on normalized titles."""
    seen = set()
    unique_papers = []

    for paper in papers:
        # Normalize title for comparison
        normalized = re.sub(r"[^\w\s]", "", paper["title"].lower()).strip()
        if normalized not in seen:
            seen.add(normalized)
            unique_papers.append(paper)

    return unique_papers


def filter_relevant(papers):
    """Keep only highly relevant papers."""
    relevant = []

    # Strong relevance indicators
    strong_keywords = [
        "learning-augmented",
        "learning augmented",
        "algorithms with predictions",
        "competitive analysis",
        "advice complexity",
        "untrusted predictions",
        "robust algorithms",
        "consistency competitive",
    ]

    for paper in papers:
        title_lower = paper["title"].lower()

        # Must contain strong indicators
        if any(keyword in title_lower for keyword in strong_keywords):
            relevant.append(paper)
        # Or be algorithmic + learning-related
        elif ("algorithm" in title_lower or "competitive" in title_lower) and (
            "learning" in title_lower
            or "prediction" in title_lower
            or "ml" in title_lower
        ):
            relevant.append(paper)

    return relevant


def analyze_findings(papers):
    """Provide analysis of discovered papers."""
    if not papers:
        return "No new papers found."

    # Group by venue
    by_venue = {}
    by_year = {}

    for paper in papers:
        venue = paper["venue"]
        year = paper["year"]

        if venue not in by_venue:
            by_venue[venue] = []
        by_venue[venue].append(paper)

        if year not in by_year:
            by_year[year] = []
        by_year[year].append(paper)

    analysis = f"""
Analysis of {len(papers)} discovered papers:

Venues represented:
"""

    for venue in sorted(by_venue.keys(), key=lambda v: len(by_venue[v]), reverse=True):
        count = len(by_venue[venue])
        analysis += f"  - {venue}: {count} papers\n"

    analysis += f"\nYear distribution:\n"
    for year in sorted(by_year.keys(), reverse=True):
        count = len(by_year[year])
        analysis += f"  - {year}: {count} papers\n"

    analysis += f"\nTop recent discoveries:\n"
    recent_papers = sorted(papers, key=lambda p: p["year"], reverse=True)[:10]

    for i, paper in enumerate(recent_papers, 1):
        authors_str = ", ".join(paper["authors"][:3])
        if len(paper["authors"]) > 3:
            authors_str += ", ..."
        analysis += f"  {i}. {paper['title']} ({paper['year']})\n"
        analysis += f"     {authors_str} - {paper['venue']}\n"

    return analysis


def main():
    print("=== ALPS Quick Paper Discovery ===")
    print("Searching for missing learning-augmented algorithm papers...\n")

    # Load existing papers (simplified)
    load_existing_titles()

    all_papers = []

    # Search DBLP
    print("\n1. Searching DBLP...")
    dblp_papers = search_dblp_simple()
    all_papers.extend(dblp_papers)
    print(f"   Found {len(dblp_papers)} papers from DBLP")

    # Search ArXiv
    print("\n2. Searching ArXiv...")
    arxiv_papers = search_arxiv_simple()
    all_papers.extend(arxiv_papers)
    print(f"   Found {len(arxiv_papers)} papers from ArXiv")

    # Remove duplicates
    print(f"\n3. Processing results...")
    unique_papers = remove_duplicates(all_papers)
    print(f"   After removing duplicates: {len(unique_papers)} papers")

    # Filter for relevance
    relevant_papers = filter_relevant(unique_papers)
    print(f"   After relevance filtering: {len(relevant_papers)} papers")

    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"discovered_papers_{timestamp}.json"

    results = {
        "search_date": datetime.now().isoformat(),
        "total_discovered": len(relevant_papers),
        "search_summary": {
            "dblp_raw": len(dblp_papers),
            "arxiv_raw": len(arxiv_papers),
            "after_dedup": len(unique_papers),
            "after_filtering": len(relevant_papers),
        },
        "papers": relevant_papers,
    }

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n4. Results saved to: {filename}")

    # Show analysis
    analysis = analyze_findings(relevant_papers)
    print(f"\n{analysis}")

    if relevant_papers:
        print(f"\nNext steps:")
        print(f"1. Review the papers in {filename}")
        print(f"2. Check if any are missing from your database")
        print(f"3. Add relevant ones to your papers/ directory")
        print(f"4. Run with different search terms if needed")
    else:
        print(f"\nNo highly relevant papers found. Consider:")
        print(f"1. Adjusting search terms")
        print(f"2. Searching specific venues manually")
        print(f"3. Using the full discovery script with more options")


if __name__ == "__main__":
    main()
