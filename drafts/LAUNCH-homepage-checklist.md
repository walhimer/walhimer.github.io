# Launch checklist — Cathedral homepage → `index.html`

**Status:** **Done (2026):** `index.html` at repo root is the Cathedral launch candidate. Backup: `drafts/archive/index-before-cathedral-homepage.html`. Catalog page includes the former homepage grid at the top.

---

## What’s already done in the launch candidate

- **Root-relative navigation:** `index.html`, `sketches/index.html`, `bio/index.html`, `contact/index.html`
- **`fetch('data/catalog.json')`** (correct from site root)
- **Production `<head>`:** Google tag (gtag), title, meta description, canonical, Open Graph, Twitter cards, JSON-LD (`jobTitle`: Digital installation artist and museum designer)
- **No `noindex`** on the launch candidate (so once it **is** `index.html`, it can be indexed)
- **Iframe `src` URLs (from site root):**
  - Bloom → `installations/bloom-four-walls-sketch.html`
  - Light Art 023 → `sketches/light-art-023/index.html`
  - Slides 3–7 → under `drafts/…` (see below)
- **Bloom still image:** `drafts/bloom-four-walls-carousel-preview.png`
- **Light Art 023 still image:** `sketches/light-art-023/light_art_023_technical_drawing.svg`
- Copy/deck text updated from “local server” language to **HTTPS / live site** wording

---

## Before you replace `index.html`

1. **Back up** current `index.html` (branch, copy, or tag).
2. **Move the old grid to Catalog** (per your plan): paste the current homepage work-card grid at the **top** of `sketches/index.html` *before* swapping the homepage, or do it in the same PR so nothing is “lost.”
3. **Confirm embeds resolve on GitHub Pages** (or your host):
   - `installations/bloom-four-walls-sketch.html` — exists in repo ✓
   - `sketches/light-art-023/index.html` — exists ✓
   - `drafts/artwork-03-…` through `06`, `drafts/traveling-landscape-emergent-dna/…` — **public URLs** will be `https://mark-walhimer.com/drafts/...` if the whole repo is published. Decide whether you’re OK with **featured work living under `/drafts/`** long-term; if not, **copy or move** those builds to `installations/` or `sketches/` and **update the `art03Url`–`art07Url` lines** in the launch candidate.
4. **Optional:** Replace `og:image` / `twitter:image` with a Cathedral-specific preview PNG when you have one (currently reuses `installations/technical-drawing-preview.png`).
5. **Optional:** Tweak `<meta name="description">` and OG descriptions after a final read.
6. **Test plan:** After deploy, click every nav link, every carousel slide (live embeds), and mobile nav. Validate **Rich Results** / social previews if you care about sharing.

---

## How to go live (single-file swap)

1. Copy `drafts/homepage-cathedral-launch-candidate.html` → **`index.html`** at the **repository root** (replace the existing file).
2. Commit and push; wait for GitHub Pages to rebuild.
3. Spot-check `https://mark-walhimer.com/` and `view-source:` for meta tags.

**Local test:** From repo root, run a static server (`python3 -m http.server`) and open `http://localhost:8000/` with the candidate copied to `index.html` temporarily—**not** from inside `drafts/` alone, or root-relative links will break.

---

## Files in `drafts/` (reference)

| File | Role |
|------|------|
| `homepage-cathedral-merge-local-draft.html` | **Local draft** — `../` paths, `noindex`, `serve-drafts.sh` language — keep for iteration |
| `homepage-cathedral-launch-candidate.html` | **Production-shaped** — use as source for `index.html` when ready |
| `LAUNCH-homepage-checklist.md` | This checklist |

---

*Last updated: launch preparation only — no live site change committed by this document.*
