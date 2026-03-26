# Mark Walhimer — Artist Site (GitHub Pages)

Static site for **[mark-walhimer.com](https://mark-walhimer.com)** (custom domain) and **[walhimer.github.io](https://walhimer.github.io)** (GitHub Pages URL).  
Local working copy: `~/Desktop/archive/walhimer-archive-fresh/`.

---

## Architecture (two layers + one manifest)

| Piece | Role |
|--------|------|
| **`artworks.json`** (repo root) | **Adjacent manifest** — canonical list of public artworks: paths, titles, dates, and whether each piece is a **project** or an **installation**. Tools and assistants should treat this as the source of truth. |
| **Projects** | **Current / exploratory work** — organized as `projects/`, `series/`, `sketches/`, and `piece/`. This is where series and works-in-progress are worked out and linked from the Projects page. |
| **Installations** | **Promoted work** — `installations/` holds the self-contained HTML files that count as major pieces. The **homepage** (`index.html`) points here. Moving a work from “project” to “installation” is a deliberate promotion step. |

**Flow:** develop in the studio machine → copy or build into this repo under **projects** (sketches / series / piece) → when ready, **promote** to **`installations/`** and add or update the matching card on **`index.html`**. Keep **`artworks.json`** in sync whenever you add, move, or retire a piece.

Legacy systems (**SQLite**, **`studio_vault.db`**, **`build.php`**, **`dist/`**, MAMP “press S” archive) are **retired**. This repo is edited directly and pushed.

---

## Self-contained artwork rule

**Default (exhibition- and Pages-safe):** each published work is **one or more static files** that run **without CDN**, **without external `<script src="https://…">` or `<link href="https://…">`**, and **without required network** for core rendering. Inline **p5.js**, **Three.js / WebGL**, fonts (e.g. embedded WOFF/OTF or base64), and images/assets inside the HTML or alongside it in the repo.

**Check:** turn off Wi‑Fi and open the file from disk. If the piece fails, it is not ready for the archive.

**Tooling (allowed):** you may use **Vite**, **Elm**, or other bundlers **locally** as long as the **artifact you commit** is self-contained for GitHub Pages (inlined or relative paths only, no mandatory remote libraries). Helper scripts in this repo (e.g. inlining libs) are optional.

**Exceptions (must be explicit):** if a piece depends on **Supabase**, another API, or live data, document that in **`artworks.json`** (e.g. `requiresNetwork: true`, `notes`) so it is never mistaken for an offline installation. Prefer keeping those rare.

---

## Folder layout (current)

```
walhimer-archive-fresh/
├── artworks.json          # Manifest — list all public pieces (create/update in sync with site)
├── CNAME                  # mark-walhimer.com
├── index.html             # Homepage — installation cards link into installations/
├── installations/         # Promoted, homepage-worthy self-contained works
├── projects/              # Projects section (e.g. projects/index.html)
├── series/                # Per-series index pages (e.g. series/bloom/index.html)
├── sketches/              # Self-contained HTML used for previews / project-tier pieces
├── piece/                 # Individual piece folders where used
├── bio/                   # Bio / CV
├── contact/               # Contact
└── …                      # Optional build helpers (Python/shell) — not required for day-to-day edits
```

If you also keep a flat **`archive/`** folder for loose project HTML, that is optional; the important split is **project-tier** vs **installation-tier** and that both appear consistently in **`artworks.json`**.

---

## `artworks.json` shape (recommended)

Use one file at the **repository root**. Example (adjust fields as you like; keep it valid JSON):

```json
{
  "version": 1,
  "pieces": [
    {
      "slug": "living-commons",
      "title": "Living Commons",
      "tier": "installation",
      "path": "installations/living-commons.html",
      "homepage": true,
      "date": "2026-01-01",
      "requiresNetwork": false,
      "tech": ["p5.js", "inlined"]
    },
    {
      "slug": "bloom-radial-study",
      "title": "Bloom — study",
      "tier": "project",
      "series": "bloom",
      "path": "sketches/radial-gradient.html",
      "date": "2026-03-17",
      "requiresNetwork": false,
      "tech": ["p5.js", "inlined"]
    }
  ]
}
```

- **`tier`:** `"project"` = current / projects area; `"installation"` = promoted, linked from homepage as appropriate.  
- **`homepage`:** `true` if there is a card on `index.html` for this installation.  
- **`requiresNetwork`:** `true` only for intentional API-backed pieces (e.g. Supabase).  
- **`piecePage`:** (optional, project tier) path to the full-view wrapper under `piece/`, e.g. `piece/orchestrator-1/index.html`.

The **Projects** page may be hand-maintained in HTML at first; the goal is for **`artworks.json`** to drive or mirror what is public so automation (and future generators) stay aligned.

---

## Day-to-day workflow

### Add or update a **project**-tier piece

1. Finalize a **self-contained** HTML (or static bundle) per the rule above.  
2. Place it under **`sketches/`**, **`piece/`**, or the right **`series/`** subtree.  
3. Add or update **`artworks.json`** (`tier: "project"`, correct `path`).  
4. Update **`projects/index.html`** (and series index if needed).  
5. Commit and push.

### Promote to **installation** (homepage)

1. Copy (or move) the self-contained file into **`installations/`** with a stable filename.  
2. Add a **work card** on **`index.html`** (copy an existing card block).  
3. Update **`artworks.json`**: set `tier` to `"installation"`, set `path`, set `homepage` as needed.  
4. Optionally remove or downgrade the old **project** entry if it was only a sketch.  
5. Commit and push.

### Retire a piece

1. Remove or relocate the HTML.  
2. Remove its entry from **`artworks.json`**.  
3. Remove links/cards from **`index.html`**, **`projects/index.html`**, or series pages.  
4. Commit and push.

### Deploy

```bash
cd ~/Desktop/archive/walhimer-archive-fresh
git add .
git commit -m "Describe change"
git push
```

GitHub Pages rebuilds from the default branch.

---

## Related paths on your machine

| Location | Purpose |
|----------|---------|
| `~/Desktop/studio/art/` | Primary **source** — sketches and experiments before they enter the archive repo. |
| `~/Desktop/archive/walhimer-archive-fresh/` | This repo — what gets pushed to GitHub Pages. |
| `~/Desktop/consulting/` | Museum Planning / client work — **not** part of this artist site. |

---

## Consistency check (your question)

Yes — this matches the intent you described:

- **JSON** at repo root is the **adjacent manifest** alongside the site tree.  
- **Projects** (GitHub/repo: `projects/` + `series/` + `sketches/` + `piece/`) are where **current** work is sorted out.  
- **Installations** are what the **front page** features; promotion is a conscious step.  
- **Everything shipped** should be **self-contained HTML** with **p5.js** and/or **Three.js / WebGL** (and fonts/assets) **inlined or relative**; **Vite** / **Elm** are fine as **build** steps if the **published** file(s) obey the same rule. **Supabase** (or any live API) is the exception and must be labeled in JSON, not the default.

---

*Last updated: March 2026 — replaces README sections that referred to SQLite, `studio_vault.db`, and `build.php`.*
