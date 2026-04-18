# OSC address map (draft v0.1)

**Namespace:** `/lightart` — all addresses use this prefix unless noted.

**Default transport:** UDP. **Default bind (dev):** `127.0.0.1:9000` (listener). **Send target:** same host/port until a config file exists.

This map aligns with **Light Art 023** `params`, `visualMode`, and derived `state` in `main.js`. Types are **targets**; implementations may coerce (e.g. bool as 0.0/1.0).

---

## Parameters (float or int as documented)

| OSC address | Args | Type | Notes |
|-------------|------|------|--------|
| `/lightart/room/ft` | 1 | float | Room width/depth (feet), square footprint in 023 |
| `/lightart/ceiling/ft` | 1 | float | Ceiling height (feet) |
| `/lightart/grid/div` | 1 | int | Grid divisions per axis |
| `/lightart/diameter` | 1 | float | Member thickness / sonic spread scale |
| `/lightart/entropy` | 1 | float | 0–1 |
| `/lightart/tempo/bpm` | 1 | float | Transport BPM |
| `/lightart/seed` | 1 | int | Optional scene seed for deterministic runs |

---

## Visual families (0 = off, 1 = on)

| OSC address | Args | Type |
|-------------|------|------|
| `/lightart/vis/grid` | 1 | float |
| `/lightart/vis/points` | 1 | float |
| `/lightart/vis/boxes` | 1 | float |
| `/lightart/vis/curves` | 1 | float |

---

## Derived / modulation (read-only export from lab, optional control in)

| OSC address | Args | Type | Notes |
|-------------|------|------|--------|
| `/lightart/morph` | 1 | float | 0–1, slow phasor analog |
| `/lightart/pulse` | 1 | float | 0–1, faster modulation analog |

---

## Robotics (intent — not wired in v0)

| OSC address | Args | Notes |
|-------------|------|--------|
| `/lightart/robot/intent` | string or blob | High-level command; **supervisor** must validate |

---

## Versioning

Bump the draft version in this heading when addresses break compatibility. Semver for released tools can track `OSC_MAP` revisions separately.
