# Light Art OSC

**Studio:** Walhimer Studio · [mark-walhimer.com](https://mark-walhimer.com)  
**Artist:** Mark Walhimer · **2026**

**Next session:** [WHEN_YOU_RETURN.md](./WHEN_YOU_RETURN.md)

---

## Purpose

This folder is the **spec and staging area** for the next layer of the light-art stack: **Open Sound Control (OSC)** as the **network glue** between a **single creative state** (room parameters, entropy, tempo, modulation) and **physical outputs**—DMX and lighting desks, MIDI devices, LED and video infrastructure, sensors, and eventually **robotics** (via a dedicated motion/safety layer, not ad-hoc OSC to motors).

The browser lab in **Light Art 023** (`light-art-023`) already behaves like a **unified instrument**: shared `params` and `state` drive Three.js and Tone.js together. **Light Art OSC** names the contract for **exporting that same state** (or a subset) to the room. Implementation is **built outward from 023**—same parameters and modulation semantics—rather than replacing the lab.

---

## Stack sketch (target)

| Layer | Role |
|--------|------|
| **Seed + Emergent DNA** | Canonical RNG and traits; replayable runs when you need the same show twice ([EmergentDNA](https://github.com/walhimer-studio/EmergentDNA)). |
| **OSC** | Primary **IP bus** for parameters, scene seed, and bridge traffic between the browser lab, controllers, and services. |
| **MIDI** | **Controllers and clock** (transport, faders, pads); normalized into the same internal state or forwarded beside OSC—not a second truth for lighting safety. |
| **Python + DMX** | Default **show path for universes**: a small Python service (e.g. via **OLA**, Art-Net/sACN, or fixture-specific stacks) subscribes to OSC or shared state and **owns DMX output**; keeps heavy UDP and device drivers out of the browser. |
| **Light Art 023** | **Phenotype lab**—Three.js + Tone.js preview of the same numbers you will send to the room. |

**North star — interface:** evolve toward a **single holistic control surface**—one place where patches, parameters, routing to lights/video/audio/robotics **intent** stay visible and editable together (working shorthand: an **Agaston Nagy–like** integrated feel). Exact UI stack is TBD; the **data model** (shared params + seed + bridges) comes first so the UI can swap without rewriting the room.

---

## Genome vs. phenotype

**Emergent DNA** is the **canonical genotype layer**: seeded deterministic randomness and trait bundles for individuals/species. Reference implementation and spec:

- [walhimer-studio/EmergentDNA](https://github.com/walhimer-studio/EmergentDNA)

Per that project: it **does not** bundle Three.js, WebGL, Tone.js, or ecology timers—those are **phenotype** in a given piece. **Light Art 023** is phenotype + room metaphor; **EmergentDNA** is where **seed replay** and **trait rules** stay consistent when you add OSC and hardware.

**Practical rule:** Any randomness that must **replay identically** from a seed should use the same **`Rand` / `SeedRng`** algorithm as in [EmergentDNA `docs/SPEC.md`](https://github.com/walhimer-studio/EmergentDNA/blob/main/docs/SPEC.md). Visual “live” jitter can stay in the piece; **exported OSC frames** for recording or sync should prefer **deterministic** streams when you need repeatability.

---

## OSC role (v1)

| Direction | Role |
|------------|------|
| **Out** | Broadcast normalized parameters (floats 0–1 or SI units where agreed): room scale, entropy, tempo, morph/pulse analogs, family toggles, optional “scene seed.” |
| **In** | Optional: fader bank, Trim-style UI, Teensy or bridge computer sends `/lightart/...` to override or nudge parameters. |

**Robotics:** treat motion as **commands** at a higher level (`/robot/intent/...` or a small JSON payload on a single OSC path) with **limits and estop** handled only in the robotics process, not in the browser.

---

## Layout

| Piece | Location |
|--------|----------|
| **Flow diagrams (Mermaid)** | [FLOW.md](./FLOW.md) |
| **OSC address map (draft)** | [OSC_MAP.md](./OSC_MAP.md) |
| **OSC bridge (minimal)** | [bridge/](./bridge/) — `osc_self_test.py` / `osc_self_test.cjs` (one window), `osc_listen.py`, `osc_send_test.py` |
| **Dependencies** | [requirements.txt](./requirements.txt) |
| **Tabbed visualize (HTML)** | [visualize/index.html](./visualize/index.html) — OSC map, Mermaid flow, bridge commands |
| **Master clock & ownership** | [MASTER_CLOCK.md](./MASTER_CLOCK.md) — one transport clock; who owns DMX vs robot safety |
| Light Art 023 | [../../sketches/light-art-023/](../../sketches/light-art-023/) — lab + OSC export |

---

## Next steps

1. ~~Draft **OSC addresses** for Light Art 023 parameters~~ → see [OSC_MAP.md](./OSC_MAP.md) (revise as needed).
2. ~~**Minimal bridge** (listen + test send)~~ → [bridge/README.md](./bridge/README.md).
3. Patch **Light Art 023** to send OSC to `127.0.0.1:9000` (or make it optional behind a toggle).
4. Add **Python → DMX** (OLA / Art-Net) behind the same mapping layer.
5. Optionally **import EmergentDNA** where new pieces need **seeded** behavior aligned with the [canonical `Rand`](https://github.com/walhimer-studio/EmergentDNA).

---

## Related projects

| Project | Role |
|---------|------|
| [light-art-023](../../sketches/light-art-023/) | Modular AV room lab (Three.js + Tone.js), shared params and state |
| [EmergentDNA](https://github.com/walhimer-studio/EmergentDNA) | Genome layer: `SeedRng` / `Rand`, `SpeciesGenome`, optional `SocialPool` |

---

## License / use

Intent matches sibling light-art work: design communication and implementation notes; hardware and robotics require separate safety and engineering review before fabrication or public operation.
