# Light Art 023 — Project notes

Light Art 023 turns the system into a **modular AV room lab**. Multiple visual families can be mixed and matched inside the same room while a shared, layered sound engine responds to the same state.

**Studio:** Walhimer Studio · [mark-walhimer.com](https://mark-walhimer.com)  
**Artist:** Mark Walhimer · **2026**

---

## Repository layout

| File | Purpose |
|------|---------|
| `index.html` | Host page + controls + visual family toggles + import map (Three.js, Tone.js) |
| `main.js` | Modular AV engine (grid, points, boxes, curves + layered random sound) |
| `light_art_023_technical_drawing.py` | SVG: plan + elevation schematic |
| `light_art_023_technical_drawing.svg` | Generated output |
| `LIGHT_ART_023.md` | This file |

### Core controls

Live controls in `index.html` update the shared state in `main.js`:

- `roomFt` (room width/depth in feet)
- `ceilingFt` (ceiling height in feet)
- `gridDiv` (grid resolution)
- `diameter` (member thickness / sonic spread)
- `entropy` (spatial irregularity + atmospheric noise)
- `tempo` (transport BPM)
- visual family toggles: `grid`, `points`, `boxes`, `curves`
- `Randomize Scene` for rapid exploration

Because the system is unified, the same controls change both the scene and the sound engine.

### Run locally

```bash
cd light-art-023
python3 -m http.server 8765
```

Open `http://localhost:8765`.

Click **Start Audio** once to unlock browser audio.

### Regenerate SVG

```bash
python3 light_art_023_technical_drawing.py
```

Optional: `python3 light_art_023_technical_drawing.py -o ~/Desktop/light_art_023.svg`

---

## Audio visual notes

- Visual families:
  - orthogonal grid
  - point cloud field
  - translucent boxes
  - spline-like curves (tube paths)
- Sound layers (inspired by the drifting ambient character you referenced in mangle):
  - bass drone drift
  - triangle lead swells
  - random pulse synth notes
  - pink-noise texture bursts
  - split reverb buses with shared transport
- A shared modulation signal (`state.morph`, `state.pulse`) drives visual shimmer and audio movement.

---

## Parameters to align

If you change default room dimensions or grid assumptions in `main.js`, update matching values in `light_art_023_technical_drawing.py` (`ROOM_W_FT`, `ROOM_D_FT`, `CEILING_FT`, `GRID_DIV`) for documentation consistency.

---

## License / use

Same intent as Light Art 020: documentation and design communication, not sole fabrication release without engineering review.
