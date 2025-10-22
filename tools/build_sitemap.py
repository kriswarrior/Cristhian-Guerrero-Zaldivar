#!/usr/bin/env python3
"""Generate sitemap.xml for the static site."""
from __future__ import annotations

import datetime as dt
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parent.parent
SITE_URL = "https://kriswarrior.github.io/Cristhian-Guerrero-Zaldivar"
EXCLUDE_DIRS = {"assets", "node_modules", "tools"}
EXCLUDE_NAMES = {"404.html"}


def is_public_html(file_path: Path) -> bool:
    """Return True if the file should be included in the sitemap."""
    if file_path.suffix.lower() != ".html":
        return False
    if any(part.startswith(".") for part in file_path.parts):
        return False
    if any(part.startswith("_") for part in file_path.parts):
        return False
    if any(part in EXCLUDE_DIRS for part in file_path.parts[:-1]):
        return False
    if file_path.name in EXCLUDE_NAMES:
        return False
    return True


def html_files(root: Path) -> Iterable[Path]:
    for file_path in root.rglob("*.html"):
        if is_public_html(file_path.relative_to(root)):
            yield file_path


def url_for(path: Path) -> str:
    relative = path.relative_to(ROOT)
    if relative.name == "index.html":
        url_path = "/" if relative.parent == Path(".") else f"/{relative.parent.as_posix()}/"
    elif relative.name == "index.htm":
        url_path = f"/{relative.with_suffix('').as_posix()}/"
    else:
        url_path = f"/{relative.as_posix()}"
    return f"{SITE_URL.rstrip('/')}{url_path}"


def last_modified_iso(path: Path) -> str:
    timestamp = path.stat().st_mtime
    file_date = dt.datetime.fromtimestamp(timestamp, dt.timezone.utc).date()
    today = dt.date.today()
    if file_date > today:
        file_date = today
    return file_date.isoformat()


def build_sitemap() -> str:
    entries = []
    for file_path in sorted(html_files(ROOT)):
        url = url_for(file_path)
        lastmod = last_modified_iso(file_path)
        priority = "0.7" if url.rstrip("/") == SITE_URL.rstrip("/") else "0.5"
        entries.append(
            f"    <url>\n"
            f"        <loc>{url}</loc>\n"
            f"        <lastmod>{lastmod}</lastmod>\n"
            f"        <changefreq>weekly</changefreq>\n"
            f"        <priority>{priority}</priority>\n"
            f"    </url>"
        )
    sitemap_body = "\n".join(entries)
    generated = (
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
        "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n"
        f"{sitemap_body}\n"
        "</urlset>\n"
    )
    return generated


def main() -> None:
    sitemap_content = build_sitemap()
    (ROOT / "sitemap.xml").write_text(sitemap_content, encoding="utf-8")


if __name__ == "__main__":
    main()
