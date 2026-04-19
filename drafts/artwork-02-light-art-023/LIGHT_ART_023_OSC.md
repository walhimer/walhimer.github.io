# Light Art 023 — OSC export

**Studio:** Walhimer Studio · **Artist:** Mark Walhimer · **2026**

The lab (`index.html` + `main.js`) now can **export the same parameters** defined in [studio/light-art-osc/OSC_MAP.md](../../studio/light-art-osc/OSC_MAP.md) as **OSC over UDP**, via a small **WebSocket → UDP relay** (browsers cannot open raw UDP sockets).

---

## Files

| File | Role |
|------|------|
| `light_art_023_osc.js` | WebSocket client; builds JSON bundles; throttles send rate |
| `main.js` | Wires snapshot + UI checkbox / URL |
| `../../studio/light-art-osc/bridge/ws_to_osc.cjs` | Node relay: WebSocket `:9091` → OSC UDP `127.0.0.1:9000` |

---

## Run

**1. Start the relay** (from this repo’s `studio/light-art-osc`, after `npm install` in `bridge/`):

```bash
cd studio/light-art-osc/bridge
node ws_to_osc.cjs
```

**2. Start the lab** (from repo root, or open the sketch path directly):

```bash
cd sketches/light-art-023
python3 -m http.server 8765
```

**3. Open** `http://localhost:8765`, enable **OSC export**, set WebSocket URL if needed (`ws://127.0.0.1:9091`).

**4. Optional:** from `studio/light-art-osc`, run `python3 bridge/osc_listen.py` to print incoming OSC on port **9000**.

---

## Behaviour

- **`/lightart/seed`** — updates when you use **Randomize Scene** (new integer seed each time).
- **Send rate** — ~12 Hz max while the page runs; **immediate** send when you move a slider or toggle a visual family.
- **Addresses** — match `OSC_MAP.md` draft v0.1.

---

## License / use

Same intent as Light Art 023 notes: lab and design communication; show hardware needs its own review.
