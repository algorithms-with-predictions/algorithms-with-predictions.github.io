"""Local DBLP database backed by the dblp.xml.gz dump and SQLite + FTS5."""

from __future__ import annotations

import gzip
import logging
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

import requests
from lxml import etree
from rich.progress import (
    BarColumn,
    DownloadColumn,
    Progress,
    TextColumn,
    TimeRemainingColumn,
    TransferSpeedColumn,
)

from alps_tool.config import (
    CACHE_DIR,
    DBLP_DB_PATH,
    DBLP_DTD_PATH,
    DBLP_DTD_URL,
    DBLP_XML_PATH,
    DBLP_XML_URL,
)

log = logging.getLogger(__name__)

# Element types we care about
_RELEVANT_TAGS = {"article", "inproceedings"}


# ── Download ──────────────────────────────────────────────────────────


def download_dblp_dump(force: bool = False) -> None:
    """Download dblp.xml.gz and dblp.dtd into CACHE_DIR."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    for url, dest in [(DBLP_DTD_URL, DBLP_DTD_PATH), (DBLP_XML_URL, DBLP_XML_PATH)]:
        if dest.exists() and not force:
            log.info("Already exists: %s (use force=True to re-download)", dest)
            continue
        _download_file(url, dest)


def _download_file(url: str, dest: Path) -> None:
    """Stream-download a file with a rich progress bar."""
    resp = requests.get(url, stream=True, timeout=30)
    resp.raise_for_status()
    total = int(resp.headers.get("content-length", 0))

    with Progress(
        TextColumn("[bold blue]{task.description}"),
        BarColumn(),
        DownloadColumn(),
        TransferSpeedColumn(),
        TimeRemainingColumn(),
    ) as progress:
        task = progress.add_task(f"Downloading {dest.name}", total=total or None)
        with open(dest, "wb") as f:
            for chunk in resp.iter_content(chunk_size=1 << 20):  # 1 MB
                f.write(chunk)
                progress.advance(task, len(chunk))


# ── Ingest / Index ───────────────────────────────────────────────────


def build_index(xml_path: Path | None = None, db_path: Path | None = None) -> int:
    """Stream-parse dblp.xml.gz and build a SQLite + FTS5 index.

    Returns the number of records inserted.
    """
    xml_path = xml_path or DBLP_XML_PATH
    db_path = db_path or DBLP_DB_PATH

    if not xml_path.exists():
        raise FileNotFoundError(
            f"{xml_path} not found — run `alps dblp ingest` first."
        )

    # DTD must be adjacent to the XML for entity resolution
    dtd_path = xml_path.parent / "dblp.dtd"
    if not dtd_path.exists():
        raise FileNotFoundError(
            f"{dtd_path} not found — run `alps dblp ingest` first."
        )

    # Remove old DB so we build fresh
    if db_path.exists():
        db_path.unlink()

    conn = sqlite3.connect(str(db_path))
    _create_schema(conn)

    count = 0
    batch: list[tuple] = []
    batch_size = 50_000

    with Progress(
        TextColumn("[bold green]{task.description}"),
        BarColumn(),
        TextColumn("{task.completed:,} records"),
        TimeRemainingColumn(),
    ) as progress:
        task = progress.add_task("Indexing DBLP", total=None)

        # lxml iterparse on gzipped XML — dtd_validation=False but load_dtd=True
        # so entity references (&auml; etc.) get resolved.
        with gzip.open(str(xml_path), "rb") as f:
            context = etree.iterparse(
                f,
                events=("end",),
                tag=tuple(_RELEVANT_TAGS),
                load_dtd=True,
                resolve_entities=True,
                huge_tree=True,
            )

            for _event, elem in context:
                rec = _extract_record(elem)
                if rec:
                    batch.append(rec)

                if len(batch) >= batch_size:
                    _insert_batch(conn, batch)
                    count += len(batch)
                    progress.update(task, completed=count)
                    batch.clear()

                # Free memory
                elem.clear()
                while elem.getprevious() is not None:
                    del elem.getparent()[0]

    # Flush remaining
    if batch:
        _insert_batch(conn, batch)
        count += len(batch)

    # Rebuild FTS index
    conn.execute(
        "INSERT INTO publications_fts(publications_fts) VALUES('rebuild')"
    )

    # Store metadata
    now = datetime.now(timezone.utc).isoformat()
    conn.execute(
        "INSERT OR REPLACE INTO meta VALUES (?, ?)", ("ingest_date", now)
    )
    conn.execute(
        "INSERT OR REPLACE INTO meta VALUES (?, ?)", ("record_count", str(count))
    )
    conn.commit()
    conn.close()

    return count


def _create_schema(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS publications (
            key   TEXT PRIMARY KEY,
            type  TEXT,
            title TEXT,
            venue TEXT,
            year  INTEGER,
            url   TEXT,
            authors TEXT
        );
        CREATE VIRTUAL TABLE IF NOT EXISTS publications_fts
            USING fts5(title, content=publications, content_rowid=rowid);
        CREATE TABLE IF NOT EXISTS meta (
            key   TEXT PRIMARY KEY,
            value TEXT
        );
    """)
    conn.commit()


def _extract_record(elem: etree._Element) -> tuple | None:
    """Extract a (key, type, title, venue, year, url, authors) tuple."""
    key = elem.get("key", "")
    rec_type = elem.tag  # "article" or "inproceedings"

    title_el = elem.find("title")
    if title_el is None:
        return None
    # itertext() collects text from sub-elements (e.g. <i>, <sub>)
    title = "".join(title_el.itertext()).strip().rstrip(".")

    if not title:
        return None

    # venue: journal for articles, booktitle for inproceedings
    if rec_type == "article":
        venue_el = elem.find("journal")
    else:
        venue_el = elem.find("booktitle")
    venue = venue_el.text.strip() if venue_el is not None and venue_el.text else ""

    year_el = elem.find("year")
    year = None
    if year_el is not None and year_el.text:
        try:
            year = int(year_el.text)
        except ValueError:
            pass

    # Electronic edition URL
    ee_el = elem.find("ee")
    url = ee_el.text.strip() if ee_el is not None and ee_el.text else ""

    # Authors
    author_els = elem.findall("author")
    authors = ", ".join(
        "".join(a.itertext()).strip() for a in author_els
    )

    return (key, rec_type, title, venue, year, url, authors)


def _insert_batch(conn: sqlite3.Connection, batch: list[tuple]) -> None:
    conn.executemany(
        "INSERT OR IGNORE INTO publications VALUES (?, ?, ?, ?, ?, ?, ?)",
        batch,
    )
    conn.commit()


# ── Query ────────────────────────────────────────────────────────────


def _get_connection(db_path: Path | None = None) -> sqlite3.Connection:
    db_path = db_path or DBLP_DB_PATH
    if not db_path.exists():
        raise FileNotFoundError(
            f"DBLP local database not found at {db_path}. "
            "Run `alps dblp ingest` to download and index the DBLP dump."
        )
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


def search_publications(
    title: str, max_results: int = 10, db_path: Path | None = None
) -> list[dict]:
    """FTS5 title search. Returns dicts with keys matching the old API shape:
    title, venue, year, key, ee/url, authors.
    """
    conn = _get_connection(db_path)

    # Build FTS5 query: quote each token so special chars don't break it
    tokens = title.split()
    fts_query = " ".join(f'"{t}"' for t in tokens if t)

    rows = conn.execute(
        """
        SELECT p.key, p.type, p.title, p.venue, p.year, p.url, p.authors
        FROM publications_fts AS f
        JOIN publications AS p ON p.rowid = f.rowid
        WHERE f.title MATCH ?
        LIMIT ?
        """,
        (fts_query, max_results),
    ).fetchall()
    conn.close()

    return [
        {
            "title": row["title"],
            "venue": row["venue"],
            "year": str(row["year"]) if row["year"] else "",
            "key": row["key"],
            "ee": row["url"],
            "url": row["url"],
            "authors": row["authors"],
            "type": row["type"],
        }
        for row in rows
    ]


def get_bibtex(dblp_key: str, db_path: Path | None = None) -> str | None:
    """Generate BibTeX from stored fields."""
    conn = _get_connection(db_path)
    row = conn.execute(
        "SELECT * FROM publications WHERE key = ?", (dblp_key,)
    ).fetchone()
    conn.close()

    if not row:
        return None

    rec_type = row["type"]
    bib_type = "article" if rec_type == "article" else "inproceedings"

    # Build a citekey from the DBLP key (e.g. "conf/nips/SmithJ23" → "DBLP:conf/nips/SmithJ23")
    citekey = f"DBLP:{row['key']}"

    parts = [f"@{bib_type}{{{citekey},"]

    if row["authors"]:
        authors_bibtex = " and ".join(
            a.strip() for a in row["authors"].split(",")
        )
        parts.append(f"  author    = {{{authors_bibtex}}},")

    parts.append(f"  title     = {{{row['title']}}},")

    if row["venue"]:
        field = "journal" if bib_type == "article" else "booktitle"
        parts.append(f"  {field:9} = {{{row['venue']}}},")

    if row["year"]:
        parts.append(f"  year      = {{{row['year']}}},")

    if row["url"]:
        parts.append(f"  url       = {{{row['url']}}},")

    parts.append("}")
    return "\n".join(parts)


def status(db_path: Path | None = None) -> dict:
    """Return ingest metadata: date, record count, DB file size."""
    db_path = db_path or DBLP_DB_PATH
    if not db_path.exists():
        return {"exists": False}

    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    meta = {
        row["key"]: row["value"]
        for row in conn.execute("SELECT key, value FROM meta").fetchall()
    }
    conn.close()

    size_mb = db_path.stat().st_size / (1024 * 1024)
    return {
        "exists": True,
        "ingest_date": meta.get("ingest_date", "unknown"),
        "record_count": meta.get("record_count", "0"),
        "db_size_mb": f"{size_mb:.1f}",
    }
