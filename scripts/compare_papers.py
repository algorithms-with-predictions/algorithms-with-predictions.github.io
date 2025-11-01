#!/usr/bin/env python3
"""
Compare discovered papers with existing database to identify truly missing papers.
"""

import json
import yaml
import re
import argparse
from pathlib import Path
from difflib import SequenceMatcher


def normalize_title(title):
    """Normalize title for comparison."""
    # Remove punctuation, convert to lowercase, remove extra spaces
    normalized = re.sub(r"[^\w\s]", "", title.lower())
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized


def load_existing_papers():
    """Load existing papers from YAML files."""
    papers = []
    papers_dir = Path("papers")

    if not papers_dir.exists():
        print("Papers directory not found!")
        return papers

    for paper_file in papers_dir.glob("*.yml"):
        try:
            with open(paper_file, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
                if data and "title" in data:
                    papers.append(
                        {
                            "title": data["title"],
                            "normalized_title": normalize_title(data["title"]),
                            "authors": data.get("authors", []),
                            "file": paper_file.name,
                        }
                    )
        except Exception as e:
            print(f"Warning: Could not parse {paper_file}: {e}")

    return papers


def similarity(a, b):
    """Calculate similarity between two strings."""
    return SequenceMatcher(None, a, b).ratio()


def find_missing_papers(discovered_file):
    """Find papers that are genuinely missing from the database."""

    # Load discovered papers
    with open(discovered_file, "r", encoding="utf-8") as f:
        discovered_data = json.load(f)

    discovered_papers = discovered_data.get("papers", [])

    # Load existing papers
    existing_papers = load_existing_papers()
    existing_titles = [p["normalized_title"] for p in existing_papers]

    print(f"Loaded {len(existing_papers)} existing papers")
    print(f"Analyzing {len(discovered_papers)} discovered papers")

    missing_papers = []
    possible_duplicates = []

    for discovered in discovered_papers:
        discovered_title = discovered["title"]
        normalized_discovered = normalize_title(discovered_title)

        # Check for exact matches
        if normalized_discovered in existing_titles:
            continue

        # Check for similar titles (potential duplicates)
        max_similarity = 0
        best_match = None

        for existing in existing_papers:
            sim = similarity(normalized_discovered, existing["normalized_title"])
            if sim > max_similarity:
                max_similarity = sim
                best_match = existing

        # If similarity is high, it's probably a duplicate
        if max_similarity > 0.8:
            possible_duplicates.append(
                {
                    "discovered": discovered,
                    "existing_match": best_match,
                    "similarity": max_similarity,
                }
            )
        else:
            # This is likely a genuinely missing paper
            missing_papers.append(discovered)

    return missing_papers, possible_duplicates


def generate_yaml_template(paper):
    """Generate YAML template for a missing paper."""

    # Create safe filename
    if paper["authors"]:
        first_author = paper["authors"][0].split()[-1]  # Last name
        year = paper["year"]
        title_words = paper["title"].split()[:3]
        safe_title = "".join(word for word in title_words if word.isalnum())
        filename = f"{first_author}{year}{safe_title}.yml"
    else:
        safe_title = "".join(
            word for word in paper["title"].split()[:3] if word.isalnum()
        )
        filename = f"{safe_title}{paper['year']}.yml"

    # Guess labels based on title
    title_lower = paper["title"].lower()
    labels = []

    if any(term in title_lower for term in ["online", "competitive"]):
        labels.append("online")
    if any(term in title_lower for term in ["approximation", "approx"]):
        labels.append("approximation")
    if any(term in title_lower for term in ["streaming", "stream"]):
        labels.append("streaming")
    if any(term in title_lower for term in ["dynamic", "incremental"]):
        labels.append("dynamic / data structure")
    if any(term in title_lower for term in ["scheduling", "schedule"]):
        labels.append("scheduling")
    if any(term in title_lower for term in ["caching", "cache", "paging"]):
        labels.append("caching / paging")
    if any(term in title_lower for term in ["matching", "assignment"]):
        labels.append("matching")

    # Format authors
    if isinstance(paper["authors"], list):
        authors_str = ", ".join(paper["authors"])
    else:
        authors_str = paper["authors"]

    yaml_content = f"""title: {paper['title']}
authors: {authors_str}
labels:{chr(10).join(f"- {label}" for label in labels) if labels else chr(10) + "- online  # TODO: Add appropriate labels"}
publications:
- name: {paper['venue']}
  url: {paper.get('url', 'TODO: Add URL')}
  year: {paper['year']}
  month: null  # TODO: Add month if known
  day: null    # TODO: Add day if known
  dblp_key: null  # TODO: Add DBLP key if available
  bibtex: null    # TODO: Add BibTeX entry
"""

    return filename, yaml_content


def main():
    parser = argparse.ArgumentParser(
        description="Find missing papers from discovery results"
    )
    parser.add_argument("discovered_file", help="JSON file with discovered papers")
    parser.add_argument(
        "--generate-yaml",
        action="store_true",
        help="Generate YAML templates for missing papers",
    )
    parser.add_argument(
        "--output-dir",
        default="missing_papers",
        help="Directory to save YAML templates",
    )

    args = parser.parse_args()

    if not Path(args.discovered_file).exists():
        print(f"Error: {args.discovered_file} not found!")
        return

    missing_papers, possible_duplicates = find_missing_papers(args.discovered_file)

    print(f"\n=== Analysis Results ===")
    print(f"Genuinely missing papers: {len(missing_papers)}")
    print(f"Possible duplicates: {len(possible_duplicates)}")

    if missing_papers:
        print(f"\n=== Missing Papers ===")
        for i, paper in enumerate(missing_papers, 1):
            authors_str = ", ".join(paper["authors"][:2]) + (
                "..." if len(paper["authors"]) > 2 else ""
            )
            print(f"{i:2d}. {paper['title']} ({paper['year']})")
            print(f"    {authors_str} - {paper['venue']}")

    if possible_duplicates:
        print(f"\n=== Possible Duplicates (Review Needed) ===")
        for i, dup in enumerate(possible_duplicates, 1):
            print(f"{i:2d}. Discovered: {dup['discovered']['title']}")
            print(f"    Existing:   {dup['existing_match']['title']}")
            print(f"    Similarity: {dup['similarity']:.2f}")
            print()

    if args.generate_yaml and missing_papers:
        output_dir = Path(args.output_dir)
        output_dir.mkdir(exist_ok=True)

        print(f"\n=== Generating YAML Templates ===")
        for paper in missing_papers:
            filename, yaml_content = generate_yaml_template(paper)
            filepath = output_dir / filename

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(yaml_content)

            print(f"Created: {filepath}")

        print(f"\nGenerated {len(missing_papers)} YAML templates in {output_dir}/")
        print("Review and edit these files, then copy to papers/ directory")


if __name__ == "__main__":
    main()
