#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Regenerate artworks.json "sketches" array from sketches/index.html (SERIES).

You maintain ONE place: the SERIES list in sketches/index.html.
Run this before commit when you want artworks.json to match:

  python3 _scripts/sync_artworks_json.py

Installations in artworks.json are left unchanged.
"""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "sketches" / "index.html"
ARTWORKS = ROOT / "artworks.json"


def extract_bracket_array(html: str, marker: str) -> str:
    """Extract the first [...] array starting after marker (balanced brackets)."""
    pos = html.index(marker) + len(marker)
    while pos < len(html) and html[pos] in " \t\n":
        pos += 1
    if pos >= len(html) or html[pos] != "[":
        raise ValueError("Expected [ after " + marker)
    start = pos
    depth = 0
    j = start
    while j < len(html):
        c = html[j]
        if c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0:
                return html[start : j + 1]
        j += 1
    raise ValueError("Unbalanced [ in SERIES array")


def parse_series_from_index(html: str) -> list[dict[str, list[str]]]:
    if "const SERIES = " not in html or "let currentFilter" not in html:
        raise SystemExit("Could not find SERIES block in sketches/index.html")
    body = extract_bracket_array(html, "const SERIES = ")

    chunks = re.split(r"\n  \{\n    name: ", body)
    out: list[dict[str, list[str]]] = []
    for raw in chunks[1:]:
        sm = re.match(
            r"'([^']*)',\s*\n\s*installation:[^\n]*\n\s*files:\s*\[", raw, re.DOTALL
        )
        if not sm:
            continue
        series_name = sm.group(1)
        rest = raw[sm.end() :]
        fm = re.search(r"^([\s\S]*?)\n    \],\s*\n  \}", rest)
        if not fm:
            fm = re.search(r"^([\s\S]*?)\n    \],\s*\n  \},", rest)
        files_body = fm.group(1) if fm else rest
        filenames = re.findall(r"\{name:\s*'([^']*)'", files_body)
        out.append({"series": series_name, "files": filenames})

    if not out:
        raise SystemExit("Parsed zero series - check index.html format.")
    return out


def main() -> None:
    html = INDEX.read_text(encoding="utf-8")
    sketches = parse_series_from_index(html)

    data = json.loads(ARTWORKS.read_text(encoding="utf-8"))
    data["sketches"] = sketches
    data["updated"] = date.today().isoformat()
    if "version" not in data:
        data["version"] = 2

    ARTWORKS.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(sketches)} series to {ARTWORKS.relative_to(ROOT)}")
    total = sum(len(s["files"]) for s in sketches)
    print(f"Total sketch files listed: {total}")


if __name__ == "__main__":
    main()
