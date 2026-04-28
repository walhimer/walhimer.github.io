# OSC MIDI Seed Bridge

Local bridge for:
- iPhone/web sliders -> WebSocket controls
- OSC input -> shared seed/state
- shared seed/state -> Roland S-1 over USB MIDI
- shared event stream -> browser visuals

## Run

```bash
cd "/Users/markwalhimer/Documents/GitHub/walhimer.github.io/machine aesthetic/osc-midi-bridge"
npm install
npm start
```

Open:
- Controller: `http://localhost:8787/controller.html`
- Visuals: `http://localhost:8787/visual.html`

## MIDI target

By default it searches for MIDI outputs containing `S-1`.

Override:

```bash
MIDI_OUTPUT_NAME="Roland S-1" npm start
```

## OSC input

Listens on UDP `9000` for:
- `/seed <number>`
- `/tempo <40..180>`
- `/density <0..1>`
- `/brightness <0..1>`
- `/mood <0..1>`

Also forwards web control changes to OSC out at `127.0.0.1:9001` under:
- `/seedscape/<key>`

## EmergentDNA alignment

RNG follows the canonical constructor/next behavior used by EmergentDNA:

```js
constructor(seed) { this.s = (seed >>> 0) || 1; }
next() { const x = Math.sin(this.s++) * 10000; return x - Math.floor(x); }
```
