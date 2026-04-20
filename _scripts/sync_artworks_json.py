#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Refresh data/catalog.json from sketches/catalog-work.html (SERIES), with fallback to sketches/index.html when SERIES is empty.

Legacy name kept so existing docs and muscle memory still work.
The manifest is data/catalog.json; artworks.json is no longer used.
"""

from __future__ import annotations

from refresh_catalog import refresh_catalog


def main() -> None:
    refresh_catalog(from_artworks=False)


if __name__ == "__main__":
    main()
