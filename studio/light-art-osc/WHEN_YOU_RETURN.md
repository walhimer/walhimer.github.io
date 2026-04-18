# When you return

Quick reminder so you do not have to reconstruct context. In **walhimer.github.io**, this stack lives under **`studio/light-art-osc/`**. How this relates to the **unified catalog**: [docs/unified-catalog.md](../../docs/unified-catalog.md#studio-tooling-outside-the-catalog).

## OSC bridge + docs

From repo root:

```bash
cd studio/light-art-osc/bridge
npm install
node ws_to_osc.cjs
```

Relay: **WebSocket** `ws://127.0.0.1:9091` → **OSC UDP** `127.0.0.1:9000`.

Python venv (`studio/light-art-osc`):

```bash
cd studio/light-art-osc
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 bridge/osc_self_test.py
```

**Visualize:** from `studio/light-art-osc`, `python3 -m http.server 8890` → http://localhost:8890/visualize/

## Light Art 023 (lab sketch)

```bash
cd sketches/light-art-023
python3 -m http.server 8765
```

Open http://localhost:8765 — enable **OSC export** after the relay is running. Details: [sketches/light-art-023/LIGHT_ART_023_OSC.md](../../sketches/light-art-023/LIGHT_ART_023_OSC.md).

## Git

Commit and push from the **walhimer.github.io** clone: `git add -A && git commit -m "…" && git push origin main`.

## Dependency pins

- Python: `requirements.txt` pins `python-osc`.
- Node: `bridge/package.json` pins `osc` and `ws` (see lockfile).
