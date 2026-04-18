# Light Art OSC — bridge (minimal)

Python **OSC listen** and **test send** scripts. **DMX / OLA** is not here yet; this proves UDP and address wiring first.

## Setup

### Python

From `light-art-osc` (parent of this folder):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Node.js (osc.js)

From `light-art-osc`:

```bash
cd bridge && npm install && cd ..
```

## Run

### One terminal (recommended)

**Python** — from `light-art-osc` with venv active:

```bash
python3 bridge/osc_self_test.py
```

**Node.js** — from `light-art-osc`:

```bash
node bridge/osc_self_test.cjs
```

You should see **13** OSC lines plus `OK — received 13 OSC messages`. No second window.

### Two terminals (when debugging live senders)

Use **two terminal tabs** (or windows). **Leave the listener running** in the first tab; do not press Ctrl-C until after you have sent test messages from the second tab.

**Tab 1 — listener**

```bash
python3 bridge/osc_listen.py
```

**Tab 2 — test send** (while tab 1 is still listening)

```bash
python3 bridge/osc_send_test.py
```

You should see **13** lines in tab 1, one per OSC message. If tab 1 is not running, tab 2 will still print `Sent test bundle` (UDP does not report whether anyone received it).

**Copy-paste:** Do not paste chat lines that start with `#` into zsh; if you see `command not found: #`, skip comment-only lines and run only the `python3 ...` commands.

**Bind all interfaces** (e.g. another machine on LAN):

```bash
python3 bridge/osc_listen.py --host 0.0.0.0 --port 9000
```

## WebSocket → OSC (Light Art 023)

The browser cannot send UDP. Run this **before** enabling OSC export in the lab:

```bash
node ws_to_osc.cjs
```

Defaults: WebSocket `ws://127.0.0.1:9091`, OSC UDP to `127.0.0.1:9000`. Override with `WS_PORT`, `OSC_PORT`, etc. (see `ws_to_osc.cjs` header).

Then open Light Art 023, check **Enable WebSocket → relay**, and use `osc_listen.py` on port 9000 to verify.

## See also

- [OSC_MAP.md](../OSC_MAP.md) — address list
- [FLOW.md](../FLOW.md) — diagrams
- [../../../sketches/light-art-023/LIGHT_ART_023_OSC.md](../../../sketches/light-art-023/LIGHT_ART_023_OSC.md) — lab wiring
