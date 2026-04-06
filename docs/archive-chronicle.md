# Walhimer Studio — archive chronicle

This document describes how **generative work, the public site, and the manifest** fit together. It is meant for the **[Walhimer Studio](https://github.com/walhimer-studio)** organization and for anyone maintaining **[mark-walhimer.com](https://mark-walhimer.com)** (repo: [`walhimer-studio/walhimer.github.io`](https://github.com/walhimer-studio/walhimer.github.io)).

---

## What “archive” means here

There are **three** related ideas:

### 1. Sketches index (live, searchable)

- **URL:** [mark-walhimer.com/sketches/](https://mark-walhimer.com/sketches/) (or `/sketches/index.html`)
- **Role:** The **working archive** of sketch files: every HTML entry is listed by **series**, with **search**, **expand/collapse**, and filters (All / Works only / Versions).
- **Source of truth for that list:** the **`SERIES` JavaScript array** in `sketches/index.html`. When you add a sketch, you add it here so it appears and is findable.

### 2. `artworks.json` (manifest)

- **Role:** A **machine-readable manifest**: installations (homepage tier), sketch series, and file names. Useful for tooling, documentation, and keeping a single JSON snapshot of the archive.
- **Sketches section:** Regenerated from `sketches/index.html` so you do **not** hand-edit long file lists.

```bash
cd ~/Documents/GitHub/walhimer.github.io
python3 _scripts/sync_artworks_json.py
```

That updates the **`sketches`** array and the **`updated`** date. The **`installations`** array is **not** overwritten; edit that part when you promote work to the homepage tier.

### 3. Narrative archive pages (chronicle + images)

- **Role:** Long-form **chronological** pages (text + images) for a phase of work, e.g. early Tezos / Objkt pieces.
- **Example:** `sketches/tezos-early-works/index.html` with assets under `sketches/tezos-early-works/assets/`.
- **Role:** Complements the index: the index lists **files**; narrative pages explain **progression** and show **stills**.

These are **not** nested Git repos — they are folders in the site repo, linked from the Sketches index like any other entry.

---

## Workflow (short)

| Step | Action |
|------|--------|
| Add a sketch file | Put self-contained HTML in `sketches/` (per site rules: works offline). |
| Register it | Add it to the right block in **`SERIES`** inside `sketches/index.html`. |
| Sync manifest | Run `python3 _scripts/sync_artworks_json.py`, then commit `artworks.json`. |
| Promote to installation | Copy to `installations/`, update homepage cards, add to **`installations`** in `artworks.json` manually. |
| Push | `git add`, `git commit`, `git push` to `main`. |

---

## GitHub backup

What is backed up for the site is whatever is **committed and pushed** to **`walhimer-studio/walhimer.github.io`**. Local-only files on a laptop are not on GitHub until you push.

---

## For the GitHub organization profile

To show an **Archive** section on **[github.com/walhimer-studio](https://github.com/walhimer-studio)**:

1. Open the org’s **`.github`** repository: [`walhimer-studio/.github`](https://github.com/walhimer-studio/.github).
2. Edit **`profile/README.md`** (see [GitHub docs: custom organization profile](https://docs.github.com/en/organizations/creating-a-custom-profile-page-for-your-organization)).
3. Add a section (you can copy the **“What archive means here”** and **Workflow** summaries above, or link to this file in the website repo):

   - Raw / permanent link to this doc on GitHub:  
     `https://github.com/walhimer-studio/walhimer.github.io/blob/main/docs/archive-chronicle.md`

That keeps the chronicle in the **website repo** as the canonical doc and lets the org page point to it or mirror a short blurb.

---

*Walhimer Studio — generative art, protocols, and interactive tools.*
