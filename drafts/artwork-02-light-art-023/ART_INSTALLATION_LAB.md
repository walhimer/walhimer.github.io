# Art Installation Lab

**Where this file belongs:** **`sketches/light-art-023/ART_INSTALLATION_LAB.md`** inside **[walhimer.github.io](https://github.com/walhimer-studio/walhimer.github.io)**. Links to `../../studio/` and `../../docs/` assume that repo layout; if you copy the file elsewhere, fix paths.

**Purpose:** Hardware and conceptual roadmap for a **dome-scale** installation: one **master brain**, **OSC/Ethernet** networking, **distributed Teensy nodes** (lights, motion), and an **Emergent DNA** layer (entropy as behavior).  
**Source:** Condensed and reorganized from *Art Installation Lab (2).pdf* (April 18, 2026).  
**Studio:** Walhimer Studio · **Artist:** Mark Walhimer

This document is **design intent**, not a fabrication release. Confirm every electrical, structural, and public-safety requirement with a qualified engineer before build-out.

---

## 1. Performance layer — master state (inputs)

Physical interfaces influence **global state** over the network (typically **OSC** to the hub).

| Role | Device | Notes |
|------|--------|--------|
| Primary sound + hands-on control | **Roland S-1** Tweak Synth | Main sound engine and knob-based performance. |
| Handheld sequencing / logic | **TrimUI Brick** + **Teensy 4.1** “Hammer” mod | Tracker-style generative sequencing; can carry robotics logic. |
| Walk-around triggers | **Noise Machine NMSVE** | Bluetooth pocket remote for simple spatial triggering. |

---

## 2. Dome brain — central processing

Fixed location; manages network routing and heavy **video / mapping** work.

| Component | Role |
|-----------|------|
| **Mini PC** (e.g. Thinvent Treo class, **Intel N100**) | Runs **Python** (Emergent DNA / master script), **Splash** (open multi-projector mapping for dome), and hub services. **Verify RAM/storage with the vendor** — consumer N100 boxes often ship with **8–16 GB** RAM, not 64 GB. |
| **Touch display** (e.g. CrowPanel / ESP32-P4 HMI, 10.1″, HDMI) | Small **dashboard** for holistic monitoring and control. |
| **Travel router** (e.g. GL.iNet Beryl AX) | Private **Wi‑Fi / Ethernet** for OSC and devices without relying on venue Wi‑Fi. |

---

## 3. Distributed nodes — one kit per zone

Each **zone** of the dome (e.g. one DMX zone, one robotic axis group) gets a **node kit**:

| Part | Role |
|------|------|
| **Teensy 4.1** (with pins) | Per-node logic; **pre-soldered pins** required for breadboard bring-up. |
| **Teensy 4.1 Ethernet kit** | **RJ45** for OSC on the wire. |
| **0.96″ I2C OLED (128×64)** | Local status (e.g. “age,” entropy). |
| **MAX485** | **DMX** when this node drives lights. |
| **DRV8825** (or later **TMC2208/2209**) | **Stepper** control for robotics; **silent drivers** (TMC) help in quiet / “meditative” pieces. |
| **Cat6** | One home run to the switch **per node** (plus PC). |

Nodes are **workers**; the **mini PC** remains the default **conductor** for show logic unless you deliberately design peer-to-peer OSC between Teensies.

---

## 4. Diagnostic and power lab

| Item | Role |
|------|------|
| Electronics starter kit | **830-point breadboard**, **MB102** power module, jumpers. |
| **5 V 5 A** supply | Lab power for nodes, small panels, and tests. |
| **Buck converters** | At long cable runs, **regulate 5 V at the node** so Teensy and motors see stable voltage. |
| **Cheap DMX RGB PAR** | Visual confirmation of lighting code. |
| **MicroSD cards** (quality brands) | Mini PC, TrimUI, each Teensy — **logging / failsafe** where applicable. |

---

## 5. Safety and reliability

| Item | Role |
|------|------|
| **Hardware E-stop** | **Cuts motor power** — not dependent on Linux or Python. Required for public robotics. |
| **Sensor feedback** (optional but strong) | **Ultrasonic** or **light** sensors on nodes → OSC **back** to hub → can raise **entropy** or change S-1 behavior when audience approaches. |
| **“Cathedral” / quiet installs** | **CO₂ / humidity** (e.g. SCD4x) can modulate **breath-like** pacing in a meditative reading of the same stack. |

---

## 6. Sensory DNA (environment → state)

Many installations mix **manual control** with **environmental input** (audience proximity, room “breath,” light). Pattern:

1. Teensy reads **sensor**.
2. Teensy sends **OSC** to mini PC (or peer nodes, if designed).
3. Hub adjusts **global entropy**, sound, or motion policy.

This matches the **Light Art OSC** idea: **one state**, many subscribers — but **robot limits** and **E-stop** stay **on hardware**, not only in software.

---

## 7. Emergent DNA — personality by entropy (draft)

Single **entropy level** (0–1 or banded) can drive **coherent** behavior across **S-1**, **nodes**, and **Splash**:

| Band | Name | Sketch of behavior |
|------|------|---------------------|
| Low | **Youth** | Obedient, tight timing, clean mapping, minimal jitter. |
| Mid | **Nervous** | Small glitches, micro-hesitation on motion, edge drift in projection. |
| High | **Decadent** | Strong autonomy; drones, heavy moves, color/timing drift; performer “negotiates” back with controls. |

A **rest / idle** state (slow pulse, tiny maintenance motion) keeps the room alive when not actively performing.

**Code shape (illustrative):** one `entropy_level` (and optionally `system_age`) in the master script; nodes and audio **read** the same value — same idea as **`/lightart/entropy`** and related OSC in **`studio/light-art-osc/OSC_MAP.md`**.

---

## 8. “Cathedral” mode (optional aesthetic)

Alternate framing: less “nervous failure,” more **harmonic, slow, architectural** motion and sound (pendulum-like robotics, organ-like S-1 pads, stained-glass-like color washes in Splash). **Convergent** randomness (pull toward a center) can replace pure subtractive jitter where appropriate.

**Additional gear often cited for this style:** multi-channel **audio interface** (e.g. 18i20 class), **spatialization** tools (e.g. SPAT, Panoramix), **silent** stepper drivers — all **optional** layers on top of the core lab list.

---

## 9. Artist references (short)

Useful precedents for **holistic** human–machine–sound work: **Sougwen Chung**, **Marco Donnarumma**, **Moritz Simon Geist**, **So Kanno**, **Patrick Tresset**; institutions such as **Ars Electronica**; for “digital cathedral” scale: **Ryoji Ikeda**, **Zimoun**, **Janet Cardiff** (*Forty Part Motet* — distributed speakers / space). Names are for **research**, not endorsement of any specific stack.

---

## 10. Relation to this repository

| Piece | Location |
|-------|----------|
| **Browser lab** (room + sound + optional OSC export) | `index.html`, `main.js`, `light_art_023_osc.js` |
| **OSC addresses + relay** | `../../studio/light-art-osc/` |
| **Technical drawing** | `light_art_023_technical_drawing.py` / `.svg` |

This roadmap **extends** the lab toward **physical dome** deployment; it does not replace **catalog** or **manifest** rules for the site — see **`../../docs/unified-catalog.md`**.
