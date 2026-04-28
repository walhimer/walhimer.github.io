const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const osc = require("osc");
const easymidi = require("easymidi");

const HTTP_PORT = Number(process.env.HTTP_PORT || 8787);
const OSC_PORT = Number(process.env.OSC_PORT || 9000);
const OSC_REMOTE_HOST = process.env.OSC_REMOTE_HOST || "127.0.0.1";
const OSC_REMOTE_PORT = Number(process.env.OSC_REMOTE_PORT || 9001);
const MIDI_OUTPUT_NAME = process.env.MIDI_OUTPUT_NAME || "S-1";
let MIDI_CHANNEL = Number(process.env.MIDI_CHANNEL || 2);

function SeedRng(seed) {
  this.s = (seed >>> 0) || 1;
}
SeedRng.prototype.next = function next() {
  const x = Math.sin(this.s++) * 10000;
  return x - Math.floor(x);
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

MIDI_CHANNEL = clamp(MIDI_CHANNEL, 0, 15);

const state = {
  seed: 123456,
  tempo: 96,
  density: 0.45,
  brightness: 0.6,
  mood: 0.5
};

let currentNote = 60;
let rng = new SeedRng(state.seed);
let midiOut = null;

try {
  const outputs = easymidi.getOutputs();
  const target = outputs.find((name) =>
    name.toLowerCase().includes(MIDI_OUTPUT_NAME.toLowerCase())
  );
  if (target) {
    midiOut = new easymidi.Output(target);
    console.log(`[midi] using output: ${target}`);
  } else {
    console.log("[midi] no matching output found, available:", outputs);
  }
} catch (err) {
  console.log("[midi] unavailable:", err.message);
}

const app = express();
app.use(express.static("public"));
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function broadcast(type, payload) {
  const msg = JSON.stringify({ type, payload });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  }
}

function reseed(seed) {
  state.seed = seed >>> 0;
  rng = new SeedRng(state.seed);
  broadcast("state", state);
}

function updateState(patch) {
  Object.assign(state, patch);
  broadcast("state", state);
}

function sendMidiFromSeedStep() {
  const scale = [0, 2, 3, 5, 7, 10];
  const octave = 36 + Math.floor(rng.next() * 24);
  const pitch = octave + scale[Math.floor(rng.next() * scale.length)];
  const vel = clamp(Math.floor(35 + rng.next() * (70 + state.brightness * 40)), 1, 127);
  const gateMs = clamp(Math.floor(70 + rng.next() * (380 * state.density)), 50, 600);

  if (midiOut) {
    console.log(`[midi] step ch=${MIDI_CHANNEL + 1} note=${pitch} vel=${vel}`);
    midiOut.send("noteoff", { note: currentNote, velocity: 0, channel: 0 });
    midiOut.send("noteon", { note: pitch, velocity: vel, channel: MIDI_CHANNEL });
    setTimeout(() => {
      if (midiOut) midiOut.send("noteoff", { note: pitch, velocity: 0, channel: MIDI_CHANNEL });
    }, gateMs);
    currentNote = pitch;

    // CC74 (filter-ish macro on many synths), CC71 (resonance-ish)
    midiOut.send("cc", {
      controller: 74,
      value: clamp(Math.floor(state.mood * 127), 0, 127),
      channel: MIDI_CHANNEL
    });
    midiOut.send("cc", {
      controller: 71,
      value: clamp(Math.floor((1 - state.mood) * 100), 0, 127),
      channel: MIDI_CHANNEL
    });
  }

  const visualEvent = {
    seed: state.seed,
    pitch,
    velocity: vel,
    mood: state.mood,
    brightness: state.brightness,
    t: Date.now()
  };
  broadcast("event", visualEvent);
}

let engineTimer = null;
function restartEngineLoop() {
  if (engineTimer) clearInterval(engineTimer);
  const beatMs = Math.max(80, Math.floor((60_000 / state.tempo) / 2));
  engineTimer = setInterval(() => {
    if (rng.next() < state.density) sendMidiFromSeedStep();
  }, beatMs);
}
restartEngineLoop();

const oscIn = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: OSC_PORT,
  metadata: true
});
oscIn.on("ready", () => console.log(`[osc] listening on udp ${OSC_PORT}`));
oscIn.on("message", (msg) => {
  const arg = msg.args && msg.args[0] ? msg.args[0].value : undefined;
  if (msg.address === "/seed" && Number.isFinite(Number(arg))) {
    reseed(Number(arg));
  } else if (msg.address === "/tempo") {
    updateState({ tempo: clamp(Number(arg), 40, 180) });
    restartEngineLoop();
  } else if (msg.address === "/density") {
    updateState({ density: clamp(Number(arg), 0, 1) });
  } else if (msg.address === "/brightness") {
    updateState({ brightness: clamp(Number(arg), 0, 1) });
  } else if (msg.address === "/mood") {
    updateState({ mood: clamp(Number(arg), 0, 1) });
  }
});
oscIn.open();

const oscOut = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 0,
  remoteAddress: OSC_REMOTE_HOST,
  remotePort: OSC_REMOTE_PORT,
  metadata: true
});
oscOut.open();

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "state", payload: state }));
  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type !== "control") return;
      const { key, value } = msg.payload || {};
      if (key === "test" && midiOut) {
        const testNote = clamp(Math.floor(Number(value) || 60), 36, 96);
        console.log(`[midi] TEST ch=${MIDI_CHANNEL + 1} note=${testNote}`);
        midiOut.send("noteon", { note: testNote, velocity: 110, channel: MIDI_CHANNEL });
        setTimeout(() => {
          if (midiOut) midiOut.send("noteoff", { note: testNote, velocity: 0, channel: MIDI_CHANNEL });
        }, 350);
      }
      if (key === "testAllChannels" && midiOut) {
        const testNote = clamp(Math.floor(Number(value) || 60), 36, 96);
        for (let ch = 0; ch < 16; ch++) {
          const delay = ch * 1500;
          setTimeout(() => {
            if (!midiOut) return;
            console.log(`[midi] TEST ALL ch=${ch + 1} note=${testNote}`);
            broadcast("testChannel", { channel: ch + 1, note: testNote });
            midiOut.send("noteon", { note: testNote, velocity: 120, channel: ch });
            setTimeout(() => {
              if (midiOut) midiOut.send("noteoff", { note: testNote, velocity: 0, channel: ch });
            }, 600);
          }, delay);
        }
      }
      if (key === "seed") reseed(Number(value) >>> 0);
      if (key === "tempo") updateState({ tempo: clamp(Number(value), 40, 180) });
      if (key === "density") updateState({ density: clamp(Number(value), 0, 1) });
      if (key === "brightness") updateState({ brightness: clamp(Number(value), 0, 1) });
      if (key === "mood") updateState({ mood: clamp(Number(value), 0, 1) });
      if (key === "tempo") restartEngineLoop();

      oscOut.send({
        address: `/seedscape/${key}`,
        args: [{ type: "f", value: Number(value) }]
      });
    } catch (err) {
      console.log("[ws] bad message", err.message);
    }
  });
});

server.listen(HTTP_PORT, () => {
  console.log(`[http] running at http://localhost:${HTTP_PORT}`);
  console.log(`[http] controller: http://localhost:${HTTP_PORT}/controller.html`);
  console.log(`[http] visuals:    http://localhost:${HTTP_PORT}/visual.html`);
  console.log(`[midi] channel:    ${MIDI_CHANNEL + 1}`);
});

