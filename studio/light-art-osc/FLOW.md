# Light Art OSC — data flow

**Studio:** Walhimer Studio · **Artist:** Mark Walhimer · **2026**

This document is the **living flow reference**. Update it when the bridge or hardware split changes.

---

## 1. System context

```mermaid
flowchart LR
  subgraph lab["Creative lab"]
    LA023["Light Art 023\nbrowser: Three.js + Tone.js"]
  end

  subgraph bridges["Network bridges"]
    OSCB["OSC UDP\n127.0.0.1 or LAN"]
    MIDIB["MIDI\ncontrollers / clock"]
  end

  subgraph services["Show services"]
    PY["Python bridge\nlisten + map"]
    DMX["DMX / Art-Net / sACN\nOLA or fixture stack"]
    ROB["Robotics supervisor\nlimits + estop"]
  end

  subgraph room["Room"]
    LX["Lights / LED"]
    VID["Video / walls"]
    MOT["Actuators"]
  end

  LA023 <-->|future export| OSCB
  MIDIB -->|normalized| PY
  OSCB <--> PY
  PY --> DMX --> LX
  PY -.->|intent only| ROB --> MOT
  LA023 --> VID
```

**Notes**

- **Light Art 023** stays the **phenotype preview**; it does not own DMX or motors.
- **Python** is the default place for **UDP OSC**, logging, and later **universe output**.
- **Robotics** never receives raw browser OSC alone; a **supervisor** enforces limits and estop.

---

## 2. Parameter and seed flow (target)

```mermaid
flowchart TB
  subgraph genotype["Genotype (replay)"]
    ED["EmergentDNA\nSeedRng / Rand"]
    SEED["scene seed\ninteger"]
  end

  subgraph state["Shared state\nmatches Light Art 023"]
    P["params:\nroom, ceiling, grid,\ndiameter, entropy, tempo"]
    V["visual toggles"]
    M["derived:\nmorph, pulse"]
  end

  subgraph wire["Export"]
    OSC["OSC messages\nsee OSC_MAP.md"]
  end

  SEED --> ED
  ED -.->|optional traits| state
  P --> OSC
  V --> OSC
  M --> OSC
```

**Notes**

- **Replayable** randomness should go through **EmergentDNA**-compatible `Rand` when you need identical runs.
- **Live** jitter in the browser can stay non-deterministic; **recorded** OSC streams for sync should use agreed rules.

---

## 3. Message sequence (slider → room, future)

```mermaid
sequenceDiagram
  participant U as Operator
  participant Web as Light Art 023
  participant Br as Python OSC bridge
  participant D as DMX service

  U->>Web: adjust entropy / tempo
  Web->>Web: update params + audio + visuals
  Note over Web,Br: future: OSC send
  Web->>Br: OSC /lightart/...
  Br->>Br: validate + map
  Br->>D: Art-Net / sACN / OLA
  D->>D: universes to fixtures
```

---

## Related files

| File | Role |
|------|------|
| [README.md](./README.md) | Stack and intent |
| [OSC_MAP.md](./OSC_MAP.md) | Address list (draft) |
| [bridge/](./bridge/) | Minimal OSC listen + test send |
