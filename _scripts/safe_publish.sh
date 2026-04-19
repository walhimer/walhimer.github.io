#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MSG="${1:-Publish catalog updates}"

echo "1/5 Layout guard..."
python3 _scripts/check_repo_layout.py

echo "2/5 Refresh catalog..."
python3 _scripts/refresh_catalog.py

echo "3/5 Stage changes..."
git add -A

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

echo "4/5 Commit..."
git commit -m "$MSG"

echo "5/5 Push..."
git push origin main

echo "Done."
