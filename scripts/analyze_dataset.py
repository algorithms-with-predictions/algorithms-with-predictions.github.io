#!/usr/bin/env python3
"""
ALPS Dataset Analysis Tool

Analyzes the existing ALPS database to identify:
1. Coverage gaps by venue and year
2. Missing author networks
3. Keyword distribution and gaps
4. Citation patterns (if data available)
5. Venue-specific trends

Usage:
    python scripts/analyze_dataset.py
    python scripts/analyze_dataset.py --report coverage
    python scripts/analyze_dataset.py --report gaps --min-year 2020
"""

import argparse
import json
import yaml
import re
from pathlib import Path
from collections import defaultdict, Counter
from datetime import datetime
import matplotlib.pyplot as plt
import pandas as pd
from typing import Dict, List, Set, Tuple


class DatasetAnalyzer:
    def __init__(self, papers_dir: str = "papers"):
        self.papers_dir = Path(papers_dir)
        self.papers = self.load_papers()

        # Known venues in theoretical CS/algorithms
        self.theory_venues = {
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
            "IPCO",
            "INTEGER",
            "WAOA",
        }

        # ML venues that might have algorithmic papers
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
            "AAMAS",
        }

        # Systems/DB venues
        self.systems_venues = {"SIGMOD", "VLDB", "ICDE", "PODS", "EDBT", "CIDR"}

    def load_papers(self) -> List[Dict]:
        """Load all papers from YAML files."""
        papers = []

        if not self.papers_dir.exists():
            print(f"Papers directory {self.papers_dir} not found!")
            return papers

        for paper_file in self.papers_dir.glob("*.yml"):
            try:
                with open(paper_file, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                    if data:
                        data["filename"] = paper_file.name
                        papers.append(data)
            except Exception as e:
                print(f"Warning: Could not parse {paper_file}: {e}")

        print(f"Loaded {len(papers)} papers from database")
        return papers

    def analyze_venue_coverage(self) -> Dict:
        """Analyze coverage by venue and year."""
        venue_stats = defaultdict(lambda: defaultdict(int))
        venue_years = defaultdict(set)

        for paper in self.papers:
            publications = paper.get("publications", [])
            for pub in publications:
                venue = pub.get("name", "Unknown")
                year = pub.get("year")
                if year:
                    venue_stats[venue][year] += 1
                    venue_years[venue].add(year)

        # Calculate coverage statistics
        coverage_analysis = {
            "total_venues": len(venue_stats),
            "venues_by_type": {"theory": {}, "ml": {}, "systems": {}, "other": {}},
            "year_range": (
                min(year for years in venue_years.values() for year in years),
                max(year for years in venue_years.values() for year in years),
            ),
            "venue_details": {},
        }

        for venue, years_data in venue_stats.items():
            total_papers = sum(years_data.values())
            years_covered = sorted(venue_years[venue])

            venue_info = {
                "total_papers": total_papers,
                "years_covered": years_covered,
                "year_range": (min(years_covered), max(years_covered)),
                "papers_by_year": dict(years_data),
            }

            coverage_analysis["venue_details"][venue] = venue_info

            # Categorize venue
            if venue in self.theory_venues:
                coverage_analysis["venues_by_type"]["theory"][venue] = venue_info
            elif venue in self.ml_venues:
                coverage_analysis["venues_by_type"]["ml"][venue] = venue_info
            elif venue in self.systems_venues:
                coverage_analysis["venues_by_type"]["systems"][venue] = venue_info
            else:
                coverage_analysis["venues_by_type"]["other"][venue] = venue_info

        return coverage_analysis

    def identify_coverage_gaps(self, min_year: int = 2018) -> Dict:
        """Identify potential gaps in venue/year coverage."""
        coverage = self.analyze_venue_coverage()
        gaps = {
            "missing_recent_years": {},
            "low_coverage_venues": {},
            "missing_major_venues": [],
            "year_gaps": {},
        }

        current_year = datetime.now().year

        # Check for missing recent years in major venues
        major_venues = ["SODA", "FOCS", "STOC", "ICALP", "ESA", "NeurIPS", "ICML"]

        for venue in major_venues:
            if venue in coverage["venue_details"]:
                venue_data = coverage["venue_details"][venue]
                years_covered = set(venue_data["years_covered"])
                expected_years = set(range(min_year, current_year + 1))
                missing_years = expected_years - years_covered

                if missing_years:
                    gaps["missing_recent_years"][venue] = sorted(missing_years)

                # Check for gaps in coverage (missing years between first and last)
                if venue_data["years_covered"]:
                    first_year = min(venue_data["years_covered"])
                    last_year = max(venue_data["years_covered"])
                    expected_range = set(range(first_year, last_year + 1))
                    year_gaps = expected_range - years_covered

                    if year_gaps:
                        gaps["year_gaps"][venue] = sorted(year_gaps)
            else:
                gaps["missing_major_venues"].append(venue)

        # Identify venues with suspiciously low coverage
        for venue, data in coverage["venue_details"].items():
            if venue in major_venues:
                years_active = len(data["years_covered"])
                if years_active > 0:
                    avg_papers_per_year = data["total_papers"] / years_active
                    if avg_papers_per_year < 1:  # Less than 1 paper per year on average
                        gaps["low_coverage_venues"][venue] = {
                            "total_papers": data["total_papers"],
                            "years_active": years_active,
                            "avg_per_year": avg_papers_per_year,
                        }

        return gaps

    def analyze_author_networks(self) -> Dict:
        """Analyze author collaboration patterns."""
        author_stats = defaultdict(int)
        author_papers = defaultdict(list)
        collaborations = defaultdict(int)

        for paper in self.papers:
            authors = paper.get("authors", [])
            if isinstance(authors, str):
                authors = [a.strip() for a in authors.split(",")]

            # Count papers per author
            for author in authors:
                author_stats[author] += 1
                author_papers[author].append(paper["title"])

            # Count collaborations
            for i, author1 in enumerate(authors):
                for author2 in authors[i + 1 :]:
                    pair = tuple(sorted([author1, author2]))
                    collaborations[pair] += 1

        # Find most prolific authors
        top_authors = sorted(author_stats.items(), key=lambda x: x[1], reverse=True)[
            :20
        ]

        # Find frequent collaborators
        top_collaborations = sorted(
            collaborations.items(), key=lambda x: x[1], reverse=True
        )[:10]

        return {
            "total_unique_authors": len(author_stats),
            "top_authors": top_authors,
            "top_collaborations": top_collaborations,
            "author_distribution": dict(Counter(author_stats.values())),
        }

    def analyze_keywords_and_topics(self) -> Dict:
        """Analyze the distribution of keywords and research topics."""
        keyword_stats = defaultdict(int)
        keyword_papers = defaultdict(list)

        for paper in self.papers:
            labels = paper.get("labels", [])
            title = paper.get("title", "")

            # Count explicit labels
            for label in labels:
                keyword_stats[label] += 1
                keyword_papers[label].append(title)

        # Analyze title keywords for implicit topics
        title_keywords = defaultdict(int)
        algorithm_types = [
            "online",
            "approximation",
            "streaming",
            "dynamic",
            "randomized",
            "competitive",
            "robust",
            "adaptive",
            "learning",
            "prediction",
        ]

        problem_domains = [
            "scheduling",
            "paging",
            "caching",
            "matching",
            "packing",
            "covering",
            "facility",
            "clustering",
            "shortest",
            "flow",
            "cut",
            "tree",
            "graph",
        ]

        for paper in self.papers:
            title_lower = paper.get("title", "").lower()

            for keyword in algorithm_types + problem_domains:
                if keyword in title_lower:
                    title_keywords[keyword] += 1

        return {
            "explicit_labels": dict(
                sorted(keyword_stats.items(), key=lambda x: x[1], reverse=True)
            ),
            "title_keywords": dict(
                sorted(title_keywords.items(), key=lambda x: x[1], reverse=True)
            ),
            "total_unique_labels": len(keyword_stats),
            "most_common_labels": sorted(
                keyword_stats.items(), key=lambda x: x[1], reverse=True
            )[:15],
            "rare_labels": [(k, v) for k, v in keyword_stats.items() if v == 1],
        }

    def temporal_analysis(self) -> Dict:
        """Analyze temporal trends in the dataset."""
        papers_by_year = defaultdict(int)
        venues_by_year = defaultdict(set)
        keywords_by_year = defaultdict(lambda: defaultdict(int))

        for paper in self.papers:
            labels = paper.get("labels", [])
            publications = paper.get("publications", [])

            for pub in publications:
                year = pub.get("year")
                venue = pub.get("name", "Unknown")

                if year:
                    papers_by_year[year] += 1
                    venues_by_year[year].add(venue)

                    for label in labels:
                        keywords_by_year[year][label] += 1

        # Calculate growth trends
        years = sorted(papers_by_year.keys())
        if len(years) > 1:
            first_half = years[: len(years) // 2]
            second_half = years[len(years) // 2 :]

            growth_rate = (
                (
                    sum(papers_by_year[y] for y in second_half)
                    / len(second_half)
                    / sum(papers_by_year[y] for y in first_half)
                    * len(first_half)
                    - 1
                )
                * 100
                if first_half
                else 0
            )
        else:
            growth_rate = 0

        return {
            "papers_by_year": dict(papers_by_year),
            "venues_per_year": {
                year: len(venues) for year, venues in venues_by_year.items()
            },
            "total_years_covered": len(years),
            "year_range": (min(years), max(years)) if years else (None, None),
            "growth_rate_percent": growth_rate,
            "peak_year": (
                max(papers_by_year.items(), key=lambda x: x[1])
                if papers_by_year
                else None
            ),
        }

    def suggest_search_targets(self) -> Dict:
        """Suggest specific venues, years, and keywords to search for missing papers."""
        coverage = self.analyze_venue_coverage()
        gaps = self.identify_coverage_gaps()
        keywords = self.analyze_keywords_and_topics()
        temporal = self.temporal_analysis()

        suggestions = {
            "priority_venues": [],
            "priority_years": [],
            "underrepresented_topics": [],
            "search_queries": [],
        }

        # Priority venues (major venues with gaps)
        major_venues_missing = gaps["missing_major_venues"]
        low_coverage = list(gaps["low_coverage_venues"].keys())
        suggestions["priority_venues"] = major_venues_missing + low_coverage

        # Priority years (recent years with few papers)
        current_year = datetime.now().year
        recent_years = list(range(current_year - 3, current_year + 1))

        for year in recent_years:
            if year in temporal["papers_by_year"]:
                if temporal["papers_by_year"][year] < 5:  # Arbitrary threshold
                    suggestions["priority_years"].append(year)
            else:
                suggestions["priority_years"].append(year)

        # Underrepresented topics (compare to what we'd expect)
        expected_topics = [
            "caching",
            "paging",
            "scheduling",
            "matching",
            "facility location",
            "clustering",
            "graph algorithms",
            "network design",
            "streaming",
            "data structures",
            "linear programming",
            "convex optimization",
        ]

        current_topics = set(keywords["explicit_labels"].keys())
        for topic in expected_topics:
            if topic not in current_topics:
                suggestions["underrepresented_topics"].append(topic)

        # Generate specific search queries
        base_terms = [
            "learning-augmented",
            "algorithms with predictions",
            "competitive analysis",
        ]

        for venue in suggestions["priority_venues"][:5]:
            for term in base_terms:
                suggestions["search_queries"].append(f'venue:{venue} "{term}"')

        for topic in suggestions["underrepresented_topics"][:5]:
            for term in base_terms:
                suggestions["search_queries"].append(f'"{term}" "{topic}"')

        return suggestions

    def generate_report(self, report_type: str = "full") -> str:
        """Generate a comprehensive analysis report."""
        coverage = self.analyze_venue_coverage()
        gaps = self.identify_coverage_gaps()
        authors = self.analyze_author_networks()
        keywords = self.analyze_keywords_and_topics()
        temporal = self.temporal_analysis()
        suggestions = self.suggest_search_targets()

        report = f"""
# ALPS Dataset Analysis Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Dataset Overview
- Total papers: {len(self.papers)}
- Total venues: {coverage['total_venues']}
- Year range: {temporal['year_range'][0]}-{temporal['year_range'][1]}
- Unique authors: {authors['total_unique_authors']}
- Unique labels: {keywords['total_unique_labels']}

## Venue Coverage
### Theory Venues ({len(coverage['venues_by_type']['theory'])} venues)
"""

        for venue, data in sorted(
            coverage["venues_by_type"]["theory"].items(),
            key=lambda x: x[1]["total_papers"],
            reverse=True,
        ):
            report += f"- {venue}: {data['total_papers']} papers ({data['year_range'][0]}-{data['year_range'][1]})\n"

        report += f"\n### ML Venues ({len(coverage['venues_by_type']['ml'])} venues)\n"
        for venue, data in sorted(
            coverage["venues_by_type"]["ml"].items(),
            key=lambda x: x[1]["total_papers"],
            reverse=True,
        ):
            report += f"- {venue}: {data['total_papers']} papers ({data['year_range'][0]}-{data['year_range'][1]})\n"

        report += f"""
## Coverage Gaps
### Missing Major Venues
{chr(10).join(f"- {venue}" for venue in gaps['missing_major_venues'])}

### Venues with Missing Recent Years
"""
        for venue, years in gaps["missing_recent_years"].items():
            report += f"- {venue}: missing {years}\n"

        report += f"""
## Temporal Trends
- Peak publication year: {temporal['peak_year'][0]} ({temporal['peak_year'][1]} papers)
- Growth rate: {temporal['growth_rate_percent']:.1f}% per period
- Papers by year:
"""

        for year in sorted(temporal["papers_by_year"].keys())[-5:]:  # Last 5 years
            report += f"  - {year}: {temporal['papers_by_year'][year]} papers\n"

        report += f"""
## Most Common Research Areas
"""
        for label, count in keywords["most_common_labels"][:10]:
            report += f"- {label}: {count} papers\n"

        report += f"""
## Top Authors
"""
        for author, count in authors["top_authors"][:10]:
            report += f"- {author}: {count} papers\n"

        report += f"""
## Search Recommendations
### Priority Venues to Search
{chr(10).join(f"- {venue}" for venue in suggestions['priority_venues'][:10])}

### Priority Years
{chr(10).join(f"- {year}" for year in suggestions['priority_years'])}

### Underrepresented Topics
{chr(10).join(f"- {topic}" for topic in suggestions['underrepresented_topics'][:10])}

### Suggested Search Queries
"""
        for query in suggestions["search_queries"][:10]:
            report += f"- {query}\n"

        return report

    def save_analysis(self, filename: str):
        """Save complete analysis to JSON file."""
        analysis = {
            "generated_at": datetime.now().isoformat(),
            "dataset_stats": {
                "total_papers": len(self.papers),
                "papers_dir": str(self.papers_dir),
            },
            "coverage": self.analyze_venue_coverage(),
            "gaps": self.identify_coverage_gaps(),
            "authors": self.analyze_author_networks(),
            "keywords": self.analyze_keywords_and_topics(),
            "temporal": self.temporal_analysis(),
            "suggestions": self.suggest_search_targets(),
        }

        with open(filename, "w", encoding="utf-8") as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False, default=str)

        print(f"Complete analysis saved to {filename}")


def main():
    parser = argparse.ArgumentParser(
        description="Analyze ALPS dataset for gaps and patterns"
    )
    parser.add_argument(
        "--report",
        choices=["full", "coverage", "gaps", "authors", "keywords"],
        default="full",
        help="Type of report to generate",
    )
    parser.add_argument(
        "--min-year", type=int, default=2018, help="Minimum year for gap analysis"
    )
    parser.add_argument("--output", help="Save analysis to JSON file")
    parser.add_argument(
        "--papers-dir", default="papers", help="Directory containing paper YAML files"
    )

    args = parser.parse_args()

    analyzer = DatasetAnalyzer(args.papers_dir)

    if args.output:
        analyzer.save_analysis(args.output)

    # Generate and display report
    report = analyzer.generate_report(args.report)
    print(report)


if __name__ == "__main__":
    main()
