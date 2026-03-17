#!/usr/bin/env python3
"""
Build self-contained shared-ground.html for installations archive.
- Embeds images from images.zip as base64 data URIs
- Replaces Tone.js with Web Audio + Salamander piano from salamander.zip
- Removes Google Fonts (system fonts)
"""
import base64
import json
import zipfile
from pathlib import Path

IMAGES_ZIP = Path("/Users/markwalhimer/Desktop/ARS Prix 2026/003_shared_ground/images.zip")
SALAMANDER_ZIP = Path("/Users/markwalhimer/Desktop/ARS Prix 2026/005_bloom_release/audio-master/salamander.zip")
SOURCE_HTML = Path("/Users/markwalhimer/Desktop/ARS Prix 2026/003_shared_ground/shared-ground (3).html")
OUTPUT = Path("/Users/markwalhimer/Desktop/:archive:/dist/installations/shared-ground.html")

# Piano samples (same as bloom-release)
SAMPLE_KEYS = ["C2", "C3", "C4", "C5", "C6", "A2", "A3", "A4", "A5",
               "Ds2", "Ds3", "Ds4", "Ds5", "Ds6", "Fs2", "Fs3", "Fs4", "Fs5", "Fs6"]

NOTE_MAP_JS = '''const NOTE_MAP = {
  "C2": {s:"C2",r:1.0}, "D2": {s:"Ds2",r:0.943874}, "E2": {s:"Ds2",r:1.059463}, "G2": {s:"Fs2",r:1.059463}, "A2": {s:"A2",r:1.0},
  "C3": {s:"C3",r:1.0}, "D3": {s:"Ds3",r:0.943874}, "E3": {s:"Ds3",r:1.059463}, "G3": {s:"Fs3",r:1.059463}, "A3": {s:"A3",r:1.0},
  "C4": {s:"C4",r:1.0}, "D4": {s:"Ds4",r:0.943874}, "E4": {s:"Ds4",r:1.059463}, "G4": {s:"Fs4",r:1.059463}, "A4": {s:"A4",r:1.0},
  "C5": {s:"C5",r:1.0}, "D5": {s:"Ds5",r:0.943874}, "E5": {s:"Ds5",r:1.059463}, "G5": {s:"Fs5",r:1.059463}, "A5": {s:"A5",r:1.0},
  "C6": {s:"C6",r:1.0}, "D6": {s:"Ds6",r:0.943874},
};'''

def main():
    # 1. Load images from zip -> base64 data URIs
    image_data = {}
    with zipfile.ZipFile(IMAGES_ZIP, "r") as zf:
        for info in zf.infolist():
            if info.filename.startswith("__MACOSX") or info.is_dir():
                continue
            fname = info.filename.replace("images/", "")
            data = zf.read(info.filename)
            ext = fname.split(".")[-1].lower()
            mime = "image/jpeg" if ext in ("jpg", "jpeg") else "image/png"
            b64 = base64.b64encode(data).decode("ascii")
            image_data[fname] = f"data:{mime};base64,{b64}"
            print(f"  {fname}: {len(data)} bytes")

    # 2. Load Salamander piano samples
    sample_b64 = {}
    with zipfile.ZipFile(SALAMANDER_ZIP, "r") as zf:
        for key in SAMPLE_KEYS:
            fname = f"salamander/{key}.mp3"
            if fname not in zf.namelist():
                fname = f"salamander/{key}.ogg"
            data = zf.read(fname)
            sample_b64[key] = base64.b64encode(data).decode("ascii")
    sample_b64_js = "const SAMPLE_B64 = {\n  " + ",\n  ".join(f'"{k}": "{v}"' for k, v in sample_b64.items()) + "\n};"

    # 3. Read source HTML
    html = SOURCE_HTML.read_text(encoding="utf-8")

    # 4. Remove Google Fonts
    html = html.replace('  <link rel="preconnect" href="https://fonts.googleapis.com"/>', "")
    html = html.replace('  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>', "")
    html = html.replace('  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=IBM+Plex+Mono:wght@300;400&display=swap" rel="stylesheet"/>', "")
    html = html.replace("font-family:'Cormorant Garamond',Georgia,serif", "font-family:Georgia,'Times New Roman',serif")
    html = html.replace("font-family:'IBM Plex Mono',monospace", "font-family:SF Mono,Monaco,Consolas,monospace")

    # 5. Replace ARCHIVE image src with data URIs
    # ARCHIVE entries have src: 'images/filename.jpg'
    import re
    def replace_src(m):
        path = m.group(1)
        fname = path.replace("images/", "")
        if fname in image_data:
            return f"src: '{image_data[fname]}'"
        return m.group(0)
    html = re.sub(r"src: 'images/([^']+)'", replace_src, html)

    # 6. Replace Tone.js piano with Web Audio
    old_piano = '''// ── PIANO SOUND — Salamander Grand, pentatonic, event-triggered ──────
// C pentatonic: C D E G A — no wrong notes, any combo sounds consonant
// History A owns the left hand (low register)
// History B owns the right hand (mid register)  
// Convergence events bloom in the upper register
let piano = null;
let soundOn = true;
let pianoReady = false;

const pentatonicA = ['C2','D2','E2','G2','A2','C3','D3','E3'];
const pentatonicB = ['G3','A3','C4','D4','E4','G4'];
const pentatonicBloom = ['C5','E5','G5','A5'];

let lastConvergeState = false; // was it converging last frame?

function buildPiano() {
  if (pianoReady) return;
  pianoReady = true;
  piano = new Tone.Sampler({
    urls: {
      C2:'C2.mp3', 'D#2':'Ds2.mp3', 'F#2':'Fs2.mp3', A2:'A2.mp3',
      C3:'C3.mp3', 'D#3':'Ds3.mp3', 'F#3':'Fs3.mp3', A3:'A3.mp3',
      C4:'C4.mp3', 'D#4':'Ds4.mp3', 'F#4':'Fs4.mp3', A4:'A4.mp3',
      C5:'C5.mp3', 'D#5':'Ds5.mp3', 'F#5':'Fs5.mp3', A5:'A5.mp3',
    },
    release: 4,
    baseUrl: 'https://tonejs.github.io/audio/salamander/',
  }).toDestination();
  Tone.getDestination().volume.value = -8;
}

function playNote(pool, velocity) {
  if (!soundOn || !pianoReady || !piano) return;
  const note = pool[Math.floor(Math.random() * pool.length)];
  piano.triggerAttackRelease(note, '2n', Tone.now(), velocity);
}
'''

    web_audio_piano = f'''// ── PIANO SOUND — Salamander Grand, embedded, Web Audio API ──────
{sample_b64_js}
{NOTE_MAP_JS}
let actx = null;
const audioBuffers = {{}};
let audioReady = false;
let soundOn = true;

function b64ToArrayBuffer(b64) {{
  const bin = atob(b64);
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return buf;
}}

async function loadAudio() {{
  actx = new (window.AudioContext || window.webkitAudioContext)();
  const keys = Object.keys(SAMPLE_B64);
  for (const note of keys) {{
    const ab = b64ToArrayBuffer(SAMPLE_B64[note]);
    audioBuffers[note] = await actx.decodeAudioData(ab);
    await new Promise(r => setTimeout(r, 0));
  }}
  audioReady = true;
}}

let masterGain = null;
function playPianoNote(noteName, velocity) {{
  if (!audioReady || !actx) return;
  const map = NOTE_MAP[noteName];
  if (!map) return;
  const buf = audioBuffers[map.s];
  if (!buf) return;
  if (!masterGain) {{
    masterGain = actx.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(actx.destination);
  }}
  const src = actx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = map.r;
  const gain = actx.createGain();
  gain.gain.value = velocity;
  gain.gain.setValueAtTime(velocity, actx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 5);
  src.connect(gain);
  gain.connect(masterGain);
  src.start(actx.currentTime);
  src.stop(actx.currentTime + 6);
}}

const pentatonicA = ['C2','D2','E2','G2','A2','C3','D3','E3'];
const pentatonicB = ['G3','A3','C4','D4','E4','G4'];
const pentatonicBloom = ['C5','E5','G5','A5'];

let lastConvergeState = false;

function playNote(pool, velocity) {{
  if (!soundOn || !audioReady) return;
  const note = pool[Math.floor(Math.random() * pool.length)];
  playPianoNote(note, velocity);
}}
'''

    html = html.replace(old_piano, web_audio_piano)

    # 7. Replace document.addEventListener for Tone.start/buildPiano with loadAudio
    html = html.replace(
        "document.addEventListener('click', () => {\n  Tone.start();\n  buildPiano();\n}, { once: true });",
        "document.addEventListener('click', () => { loadAudio(); }, { once: true });"
    )

    # 8. Remove Tone.js script tag
    html = html.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js"></script>', "")

    # 9. Fix reel img src - they use p.src which we already changed to data URI in ARCHIVE
    # The reel builds: `<img src="${p.src}"` - so p.src is already the data URI. Good.

    OUTPUT.write_text(html, encoding="utf-8")
    print(f"Wrote {OUTPUT}")
    print(f"Size: {len(html):,} bytes")

if __name__ == "__main__":
    main()
