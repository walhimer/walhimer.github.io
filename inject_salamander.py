#!/usr/bin/env python3
"""
Inject Salamander piano samples from salamander.zip into bloom-release.html.
Replaces Tone.Sampler with Web Audio API + base64-embedded samples.
"""
import base64
import re
import zipfile
from pathlib import Path

ZIP_PATH = Path("/Users/markwalhimer/Desktop/ARS Prix 2026/005_bloom_release/audio-master/salamander.zip")
BLOOM_RELEASE = Path("/Users/markwalhimer/Desktop/:archive:/dist/installations/bloom-release.html")

# 16 samples needed for pentatonic mapping (C2-C6, A2-A5, Ds2-Ds6, Fs2-Fs6)
SAMPLE_KEYS = ["C2", "C3", "C4", "C5", "C6", "A2", "A3", "A4", "A5",
               "Ds2", "Ds3", "Ds4", "Ds5", "Ds6", "Fs2", "Fs3", "Fs4", "Fs5", "Fs6"]

NOTE_MAP_JS = '''const NOTE_MAP = {
  "C2": {s:"C2",r:1.0},
  "D2": {s:"Ds2",r:0.943874},
  "E2": {s:"Ds2",r:1.059463},
  "G2": {s:"Fs2",r:1.059463},
  "A2": {s:"A2",r:1.0},
  "C3": {s:"C3",r:1.0},
  "D3": {s:"Ds3",r:0.943874},
  "E3": {s:"Ds3",r:1.059463},
  "G3": {s:"Fs3",r:1.059463},
  "A3": {s:"A3",r:1.0},
  "C4": {s:"C4",r:1.0},
  "D4": {s:"Ds4",r:0.943874},
  "E4": {s:"Ds4",r:1.059463},
  "G4": {s:"Fs4",r:1.059463},
  "A4": {s:"A4",r:1.0},
  "C5": {s:"C5",r:1.0},
  "D5": {s:"Ds5",r:0.943874},
  "E5": {s:"Ds5",r:1.059463},
  "G5": {s:"Fs5",r:1.059463},
  "A5": {s:"A5",r:1.0},
  "C6": {s:"C6",r:1.0},
  "D6": {s:"Ds6",r:0.943874},
};'''

def main():
    # Extract samples from zip
    sample_b64 = {}
    with zipfile.ZipFile(ZIP_PATH, "r") as zf:
        for key in SAMPLE_KEYS:
            fname = f"salamander/{key}.mp3"
            if fname not in zf.namelist():
                print(f"Warning: {fname} not in zip, trying .ogg")
                fname = f"salamander/{key}.ogg"
            if fname not in zf.namelist():
                raise FileNotFoundError(f"{key}.mp3/.ogg not found in {ZIP_PATH}")
            data = zf.read(fname)
            sample_b64[key] = base64.b64encode(data).decode("ascii")
            print(f"  {key}: {len(data)} bytes -> {len(sample_b64[key])} b64")

    # Build SAMPLE_B64 JS
    lines = ['const SAMPLE_B64 = {']
    for k, v in sample_b64.items():
        lines.append(f'  "{k}": "{v}",')
    lines[-1] = lines[-1].rstrip(",")  # remove trailing comma
    lines.append("};")
    sample_b64_js = "\n".join(lines)

    # Web Audio engine (no progress bar - bloom-release has no overlay)
    web_audio_js = '''
let actx = null;
const audioBuffers = {};
let audioReady = false;

function b64ToArrayBuffer(b64) {
  const bin = atob(b64);
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return buf;
}

async function loadAudio() {
  actx = new (window.AudioContext || window.webkitAudioContext)();
  const keys = Object.keys(SAMPLE_B64);
  for (const note of keys) {
    const ab = b64ToArrayBuffer(SAMPLE_B64[note]);
    audioBuffers[note] = await actx.decodeAudioData(ab);
    await new Promise(r => setTimeout(r, 0));
  }
  audioReady = true;
}

let masterGain = null;

function playNote(noteName, velocity) {
  if (!audioReady || !actx) return;
  const map = NOTE_MAP[noteName];
  if (!map) return;
  const buf = audioBuffers[map.s];
  if (!buf) return;

  if (!masterGain) {
    masterGain = actx.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(actx.destination);
  }

  const src = actx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = map.r;

  const gain = actx.createGain();
  gain.gain.value = velocity;
  gain.gain.setValueAtTime(velocity, actx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 6);

  src.connect(gain);
  gain.connect(masterGain);
  src.start(actx.currentTime);
  src.stop(actx.currentTime + 7);
}
'''

    # Read bloom-release
    html = BLOOM_RELEASE.read_text(encoding="utf-8")

    # 1. Remove Tone.js script block (the <script> that contains Tone.js minified)
    tone_script_pattern = r'<script>\s*!function\(t,e\)\{"object"==typeof exports[^<]*</script>'
    html = re.sub(tone_script_pattern, "", html, flags=re.DOTALL)

    # 2. Replace the horn/Tone.Sampler block with Web Audio
    old_block = r'''// ── PENTATONIC AUDIO — Salamander piano, pure sustain ─────────────────
// C pentatonic across 4\+ octaves — exactly 22 distinct notes
// Shuffled each cycle so no two blooms share a note
const PENTA_POOL = \[
  'C2','D2','E2','G2','A2',
  'C3','D3','E3','G3','A3',
  'C4','D4','E4','G4','A4',
  'C5','D5','E5','G5','A5',
  'C6','D6',
\];

// Shuffle pool each garden cycle — assign without replacement
function shufflePool\(rng\) \{
  const pool = \[\.\.\.PENTA_POOL\];
  for \(let i = pool\.length - 1; i > 0; i--\) \{
    const j = Math\.floor\(rng\.range\(0, i \+ 1\)\);
    \[pool\[i\], pool\[j\]\] = \[pool\[j\], pool\[i\]\];
  \}
  return pool;
\}

let noteAssignments = \[\];

let horn = null;
let hornReady = false;

function buildHorn\(\) \{
  if \(hornReady\) return;
  hornReady = true;
  horn = new Tone\.Sampler\(\{
    urls: \{
      C2:'C2\.mp3', D2:'D2\.mp3', E2:'E2\.mp3', G2:'G2\.mp3', A2:'A2\.mp3',
      C3:'C3\.mp3', D3:'D3\.mp3', E3:'E3\.mp3', G3:'G3\.mp3', A3:'A3\.mp3',
      C4:'C4\.mp3', D4:'D4\.mp3', E4:'E4\.mp3', G4:'G4\.mp3', A4:'A4\.mp3',
      C5:'C5\.mp3', D5:'D5\.mp3', E5:'E5\.mp3', G5:'G5\.mp3', A5:'A5\.mp3',
      C6:'C6\.mp3', D6:'D6\.mp3',
    \},
    release: 5,
    baseUrl: '\./samples/',
  \}\)\.toDestination\(\);
  Tone\.getDestination\(\)\.volume\.value = -8;
\}

function playNote\(note, velocity\) \{
  if \(!hornReady \|\| !horn \|\| !note\) return;
  horn\.triggerAttackRelease\(note, '2n', Tone\.now\(\), velocity\);
\}

document\.addEventListener\('click', \(\) => \{ Tone\.start\(\); buildHorn\(\); \}, \{ once: true \}\);
document\.addEventListener\('keydown', \(\) => \{ Tone\.start\(\); buildHorn\(\); \}, \{ once: true \}\);'''

    new_block = f'''// ── PENTATONIC AUDIO — Salamander piano, embedded, Web Audio API ─────────
const SAMPLE_B64 = {sample_b64_js}

{NOTE_MAP_JS}
{web_audio_js}

// C pentatonic across 4+ octaves — exactly 22 distinct notes
const PENTA_POOL = [
  'C2','D2','E2','G2','A2',
  'C3','D3','E3','G3','A3',
  'C4','D4','E4','G4','A4',
  'C5','D5','E5','G5','A5',
  'C6','D6',
];

function shufflePool(rng) {{
  const pool = [...PENTA_POOL];
  for (let i = pool.length - 1; i > 0; i--) {{
    const j = Math.floor(rng.range(0, i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }}
  return pool;
}}

let noteAssignments = [];

document.addEventListener('click', () => {{ loadAudio(); }}, {{ once: true }});
document.addEventListener('keydown', () => {{ loadAudio(); }}, {{ once: true }});'''

    # Simpler replacement: find the exact block by unique substrings
    html = html.replace(
        "let horn = null;\nlet hornReady = false;\n\nfunction buildHorn() {",
        "// Web Audio + embedded samples (no Tone.js)\n" + sample_b64_js + "\n\n" + NOTE_MAP_JS + web_audio_js + "\n// (horn/buildHorn removed)\n"
    )
    # Remove buildHorn and old playNote, fix event listeners
    html = re.sub(
        r"if \(hornReady\) return;\s*hornReady = true;\s*horn = new Tone\.Sampler\(\{[^}]+\}\)\.toDestination\(\);\s*Tone\.getDestination\(\)\.volume\.value = -8;\s*\}\s*function playNote\(note, velocity\) \{[^}]+\}\s*document\.addEventListener\('click',[^;]+;\s*document\.addEventListener\('keydown',[^;]+;",
        "document.addEventListener('click', () => { loadAudio(); }, { once: true });\ndocument.addEventListener('keydown', () => { loadAudio(); }, { once: true });",
        html,
        flags=re.DOTALL
    )

    # Simpler: do a multi-step search_replace
    # Step 1: Remove Tone.js script
    start_marker = '<script>\n!function(t,e){"object"==typeof exports'
    if start_marker in html:
        # Find the script block
        idx = html.find(start_marker)
        end_idx = html.find("</script>", idx) + len("</script>")
        html = html[:idx] + html[end_idx:]
        print("Removed Tone.js script")
    else:
        print("Tone.js script not found (may already be removed)")

    # Step 2: Replace horn block - use a smaller unique string
    old_horn = """let horn = null;
let hornReady = false;

function buildHorn() {
  if (hornReady) return;
  hornReady = true;
  horn = new Tone.Sampler({
    urls: {
      C2:'C2.mp3', D2:'D2.mp3', E2:'E2.mp3', G2:'G2.mp3', A2:'A2.mp3',
      C3:'C3.mp3', D3:'D3.mp3', E3:'E3.mp3', G3:'G3.mp3', A3:'A3.mp3',
      C4:'C4.mp3', D4:'D4.mp3', E4:'E4.mp3', G4:'G4.mp3', A4:'A4.mp3',
      C5:'C5.mp3', D5:'D5.mp3', E5:'E5.mp3', G5:'G5.mp3', A5:'A5.mp3',
      C6:'C6.mp3', D6:'D6.mp3',
    },
    release: 5,
    baseUrl: './samples/',
  }).toDestination();
  Tone.getDestination().volume.value = -8;
}

function playNote(note, velocity) {
  if (!hornReady || !horn || !note) return;
  horn.triggerAttackRelease(note, '2n', Tone.now(), velocity);
}

document.addEventListener('click', () => { Tone.start(); buildHorn(); }, { once: true });
document.addEventListener('keydown', () => { Tone.start(); buildHorn(); }, { once: true });"""

    new_horn = f"""const SAMPLE_B64 = {sample_b64_js}

{NOTE_MAP_JS}
{web_audio_js}

document.addEventListener('click', () => {{ loadAudio(); }}, {{ once: true }});
document.addEventListener('keydown', () => {{ loadAudio(); }}, {{ once: true }});"""

    if old_horn in html:
        html = html.replace(old_horn, new_horn)
        print("Replaced Tone.Sampler with Web Audio + embedded samples")
    else:
        print("WARNING: horn block not found exactly - checking...")
        if "Tone.Sampler" in html:
            print("Tone.Sampler still present - manual fix may be needed")
        else:
            print("Tone.Sampler already removed")

    BLOOM_RELEASE.write_text(html, encoding="utf-8")
    print(f"Wrote {BLOOM_RELEASE}")
    print(f"File size: {len(html):,} bytes")

if __name__ == "__main__":
    main()
