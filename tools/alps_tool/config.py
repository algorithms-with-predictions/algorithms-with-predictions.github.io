"""Paths, API URLs, rate limits, and label constants."""

import os
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────
ROOT_DIR = Path(__file__).resolve().parent.parent.parent  # alps/
PAPERS_DIR = ROOT_DIR / "papers"
TOOLS_DIR = ROOT_DIR / "tools"
CACHE_DIR = TOOLS_DIR / ".cache"
REPORTS_DIR = TOOLS_DIR / "reports"

# ── Semantic Scholar ───────────────────────────────────────────────────
S2_API_BASE = "https://api.semanticscholar.org/graph/v1"
S2_API_KEY = os.environ.get("S2_API_KEY", "")
S2_RATE_LIMIT = 10.0 if S2_API_KEY else 1.0  # requests per second
S2_FIELDS_PAPER = "title,authors,year,externalIds,publicationVenue,url"
S2_FIELDS_CITATIONS = "title,authors,year,externalIds,publicationVenue,url"

# ── DBLP (local XML dump) ─────────────────────────────────────────────
DBLP_XML_URL = "https://dblp.uni-trier.de/xml/dblp.xml.gz"
DBLP_DTD_URL = "https://dblp.uni-trier.de/xml/dblp.dtd"
DBLP_DB_PATH = CACHE_DIR / "dblp.db"
DBLP_XML_PATH = CACHE_DIR / "dblp.xml.gz"
DBLP_DTD_PATH = CACHE_DIR / "dblp.dtd"

# ── Cache TTL (seconds) ───────────────────────────────────────────────
CACHE_TTL_S2 = 7 * 24 * 3600       # 7 days

# ── Matching ──────────────────────────────────────────────────────────
FUZZY_MATCH_THRESHOLD = 85  # rapidfuzz score 0-100

# ── Labels ────────────────────────────────────────────────────────────
# Type labels (special display styling)
TYPE_LABELS = [
    "dynamic / data structure",
    "online",
    "running time",
    "approximation",
    "streaming",
    "game theory / mechanism design",
    "differential privacy",
    "survey",
]

PRIOR_LABEL = "prior / related work"
SPECIAL_LABELS = TYPE_LABELS + [PRIOR_LABEL]

# ── Venue Aliases ─────────────────────────────────────────────────────
# Map long venue names → short canonical names used in ALPS YAML
VENUE_ALIASES = {
    "Advances in Neural Information Processing Systems": "NeurIPS",
    "Neural Information Processing Systems": "NeurIPS",
    "International Conference on Machine Learning": "ICML",
    "International Conference on Learning Representations": "ICLR",
    "AAAI Conference on Artificial Intelligence": "AAAI",
    "International Joint Conference on Artificial Intelligence": "IJCAI",
    "ACM SIGMETRICS": "SIGMETRICS",
    "Symposium on Discrete Algorithms": "SODA",
    "ACM-SIAM Symposium on Discrete Algorithms": "SODA",
    "Symposium on Theory of Computing": "STOC",
    "ACM Symposium on Theory of Computing": "STOC",
    "Foundations of Computer Science": "FOCS",
    "IEEE Symposium on Foundations of Computer Science": "FOCS",
    "Innovations in Theoretical Computer Science": "ITCS",
    "ACM Conference on Economics and Computation": "EC",
    "Economics and Computation": "EC",
    "European Symposium on Algorithms": "ESA",
    "International Symposium on Algorithms and Computation": "ISAAC",
    "Algorithmic Learning Theory": "ALT",
    "International Conference on Artificial Intelligence and Statistics": "AISTATS",
    "Conference on Learning Theory": "COLT",
    "World Wide Web Conference": "WWW",
    "ACM Web Conference": "WWW",
    "The Web Conference": "WWW",
    "Knowledge Discovery and Data Mining": "KDD",
    "ACM SIGKDD": "KDD",
    "Mathematical Programming": "Math. Program.",
    "Mathematics of Operations Research": "Math. Oper. Res.",
    "Operations Research": "Oper. Res.",
    "Journal of the ACM": "J. ACM",
    "SIAM Journal on Computing": "SIAM J. Comput.",
    "Algorithmica": "Algorithmica",
    "Information Processing Letters": "Inf. Process. Lett.",
    "arXiv.org": "arXiv",
    "ArXiv": "arXiv",
}

# ── YAML Field Order ──────────────────────────────────────────────────
YAML_FIELD_ORDER = [
    "title",
    "authors",
    "abstract",
    "labels",
    "publications",
    "year",
    "arxiv",
    "s2_id",
]

PUBLICATION_FIELD_ORDER = [
    "name",
    "url",
    "year",
    "month",
    "day",
    "dblp_key",
    "bibtex",
]
