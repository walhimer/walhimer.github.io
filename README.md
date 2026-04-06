# Mark Walhimer — artist site

**[mark-walhimer.com](https://mark-walhimer.com)** · GitHub Pages · repo: **[walhimer-studio/walhimer.github.io](https://github.com/walhimer-studio/walhimer.github.io)**

---

## Structure

Two tiers on the site, plus a JSON manifest and optional narrative archive pages.

| Location | Purpose |
|----------|---------|
| `installations/` | Promoted work — pieces linked from the homepage |
| `sketches/` | Full archive — HTML sketches by series, plus optional folders like `tezos-early-works/` (chronicle + images) |
| `sketches/index.html` | **Sketches UI** — series list, search, filters (**single source of truth** for sketch filenames) |
| `artworks.json` | Manifest — installations + sketch series/file lists (**run sync script** for the `sketches` section; see below) |

Site nav: **Installations · Sketches · Soundscapes · Bio / CV · Contact**

**Archive chronicle (how this fits together):** see **[docs/archive-chronicle.md](docs/archive-chronicle.md)**.

---

## Workflow

### Add a new sketch

1. Add self-contained HTML under `sketches/`.
2. Register it in **`sketches/index.html`** → **`SERIES`** array (correct series and file row).
3. Refresh the manifest:  
   `python3 _scripts/sync_artworks_json.py`  
   then commit **`artworks.json`** (and push). The script **only** rebuilds the **`sketches`** section; it does **not** change **`installations`**.
4. Push the repo.

### Promote a sketch to installation

1. Copy or place the file under `installations/` as needed.
2. Add cards in `index.html` and `installations/index.html`.
3. Edit **`artworks.json`** manually — **`installations`** array (slug, path, dates, etc.).
4. Push.

### Narrative archive (e.g. Tezos / Objkt phase)

1. Add a folder under `sketches/` (e.g. `sketches/your-series/index.html` + `assets/`).
2. Add one entry to **`SERIES`** in `sketches/index.html` so it appears in search and the archive list.
3. Run **`sync_artworks_json.py`**, commit, push.

### Push

```bash
cd ~/Documents/GitHub/walhimer.github.io
git add .
git status
git commit -m "Description of change"
git push origin main
```

---

## Self-contained rule

Published files should work offline — no required external CDNs or network for core behavior. Test with Wi‑Fi off when in doubt.

---

## Walhimer Studio (organization)

Studio protocols, tools, and related repos live under **[github.com/walhimer-studio](https://github.com/walhimer-studio)**. The **site** repo is this one; the org profile can link to **[docs/archive-chronicle.md](docs/archive-chronicle.md)** for the archive story.

---

*Updated April 2026.*
