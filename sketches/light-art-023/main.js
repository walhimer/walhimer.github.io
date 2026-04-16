/**
 * Light Art 023 — Walhimer Studio — Mark Walhimer, 2026
 * Modular audiovisual room with mixed visual families and layered random audio.
 */
import * as THREE from 'three';
import * as Tone from 'tone';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const params = {
  roomFt: 24,
  ceilingFt: 12,
  gridDiv: 18,
  diameter: 1.2,
  entropy: 0.56,
  tempo: 68,
};

const visualMode = {
  grid: true,
  points: true,
  boxes: true,
  curves: true,
};

const state = {
  morph: 0,
  pulse: 0,
  audioReady: false,
  visualComplexity: 1,
};

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function seeded01(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function randomIn(min, max) {
  return min + Math.random() * (max - min);
}

function activeVisualCount() {
  return Number(visualMode.grid) + Number(visualMode.points) + Number(visualMode.boxes) + Number(visualMode.curves);
}

function buildGridMeshes() {
  const verticalParts = [];
  const horizontalParts = [];
  const step = params.roomFt / params.gridDiv;
  const lineThick = THREE.MathUtils.lerp(0.018, 0.1, clamp(params.diameter / 2.8, 0, 1));
  const minSeg = Math.round(THREE.MathUtils.lerp(1, 4, params.entropy));
  const maxSeg = Math.round(THREE.MathUtils.lerp(2, 6, params.entropy));

  for (let i = 0; i <= params.gridDiv; i += 1) {
    for (let j = 0; j <= params.gridDiv; j += 1) {
      const x = i * step;
      const z = j * step;
      const g = new THREE.BoxGeometry(lineThick, params.ceilingFt, lineThick);
      g.translate(x, params.ceilingFt / 2, z);
      verticalParts.push(g);
    }
  }

  for (let i = 0; i < params.gridDiv; i += 1) {
    for (let j = 0; j <= params.gridDiv; j += 1) {
      const z = j * step;
      const x0 = i * step;
      const x1 = (i + 1) * step;
      const seed = i * 17 + j * 31;
      const segs = minSeg + Math.floor(seeded01(seed + params.entropy * 37) * (maxSeg - minSeg + 1));
      for (let s = 0; s < segs; s += 1) {
        const y = 0.25 + seeded01(seed + s * 13 + params.entropy * 91) * (params.ceilingFt - 0.5);
        const h = new THREE.BoxGeometry(x1 - x0, lineThick, lineThick);
        h.translate((x0 + x1) / 2, y, z);
        horizontalParts.push(h);
      }
    }
  }

  for (let j = 0; j < params.gridDiv; j += 1) {
    for (let i = 0; i <= params.gridDiv; i += 1) {
      const x = i * step;
      const z0 = j * step;
      const z1 = (j + 1) * step;
      const seed = j * 29 + i * 19;
      const segs = minSeg + Math.floor(seeded01(seed + 999.1) * (maxSeg - minSeg + 1));
      for (let s = 0; s < segs; s += 1) {
        const y = 0.25 + seeded01(seed + s * 11 + params.entropy * 117) * (params.ceilingFt - 0.5);
        const h = new THREE.BoxGeometry(lineThick, lineThick, z1 - z0);
        h.translate(x, y, (z0 + z1) / 2);
        horizontalParts.push(h);
      }
    }
  }

  const vGeo = mergeGeometries(verticalParts, false);
  const hGeo = mergeGeometries(horizontalParts, false);
  verticalParts.forEach((g) => g.dispose());
  horizontalParts.forEach((g) => g.dispose());

  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1.65,
    transparent: true,
    opacity: 0.9,
    roughness: 0.25,
    metalness: 0.04,
  });
  return [new THREE.Mesh(vGeo, mat), new THREE.Mesh(hGeo, mat)];
}

function buildPointCloud() {
  const count = Math.round(THREE.MathUtils.lerp(600, 3600, params.entropy));
  const data = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    data[i * 3] = Math.random() * params.roomFt;
    data[i * 3 + 1] = Math.random() * params.ceilingFt;
    data[i * 3 + 2] = Math.random() * params.roomFt;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(data, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xc6e6ff,
    size: THREE.MathUtils.lerp(0.02, 0.12, params.diameter / 2.8),
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Points(g, mat);
}

function buildTranslucentBoxes() {
  const count = Math.round(THREE.MathUtils.lerp(24, 180, params.entropy));
  const group = new THREE.Group();
  for (let i = 0; i < count; i += 1) {
    const w = randomIn(0.18, 1.3) * params.diameter;
    const h = randomIn(0.18, 2.8) * params.diameter;
    const d = randomIn(0.18, 1.3) * params.diameter;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.56 + randomIn(-0.12, 0.12), 0.5, 0.55),
        emissive: 0x1a2f40,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: randomIn(0.18, 0.55),
        roughness: 0.36,
        metalness: 0.05,
      })
    );
    mesh.position.set(Math.random() * params.roomFt, Math.random() * params.ceilingFt, Math.random() * params.roomFt);
    group.add(mesh);
  }
  return group;
}

function buildCurves() {
  const group = new THREE.Group();
  const curveCount = Math.round(THREE.MathUtils.lerp(3, 16, params.entropy));
  const radius = THREE.MathUtils.lerp(0.02, 0.18, params.diameter / 2.8);
  for (let i = 0; i < curveCount; i += 1) {
    const pts = [];
    const n = 5 + Math.floor(Math.random() * 4);
    for (let j = 0; j < n; j += 1) {
      pts.push(
        new THREE.Vector3(
          Math.random() * params.roomFt,
          Math.random() * params.ceilingFt,
          Math.random() * params.roomFt
        )
      );
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.2 + params.entropy * 0.65);
    const geo = new THREE.TubeGeometry(curve, 64, radius, 8, false);
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: 0xc9f7ff,
        emissive: 0x4a9ab8,
        emissiveIntensity: 0.62,
        transparent: true,
        opacity: 0.7,
        roughness: 0.2,
        metalness: 0.08,
      })
    );
    group.add(mesh);
  }
  return group;
}

function disposeNode(node) {
  node.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}

function createAudioEngine() {
  const limiter = new Tone.Limiter(-3).toDestination();
  const master = new Tone.Gain(0.92).connect(limiter);
  const reverbBass = new Tone.Reverb({ decay: 6.4, wet: 0.45 }).connect(master);
  const reverbLine = new Tone.Reverb({ decay: 5.4, wet: 0.64 }).connect(master);
  const reverbPerc = new Tone.Reverb({ decay: 2.4, wet: 0.3 }).connect(master);

  const droneOsc = new Tone.Oscillator({ type: 'sine', frequency: Tone.Frequency(36, 'midi').toFrequency() }).start();
  const droneGain = new Tone.Gain(0.035).connect(reverbBass);
  droneOsc.connect(droneGain);

  const triOsc = new Tone.Oscillator({ type: 'triangle', frequency: Tone.Frequency(48, 'midi').toFrequency() }).start();
  const triGain = new Tone.Gain(0.001).connect(reverbLine);
  triOsc.connect(triGain);

  const padFilter = new Tone.Filter(900, 'lowpass').connect(reverbLine);
  const pad = new Tone.PolySynth(Tone.AMSynth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.9, decay: 0.2, sustain: 0.6, release: 3.2 },
    volume: -16,
  }).connect(padFilter);

  const noise = new Tone.Noise('pink').start();
  const noiseGain = new Tone.Gain(0.0).connect(reverbPerc);
  noise.connect(noiseGain);

  const penta = [48, 50, 53, 55, 57, 60];
  const bassDrift = [36, 38, 41, 43];

  const pulseLoop = new Tone.Loop((time) => {
    const idx = Math.floor(Math.random() * penta.length);
    const midi = penta[idx] + (Math.random() > 0.72 ? 12 : 0);
    const velocity = THREE.MathUtils.lerp(0.18, 0.72, clamp(state.pulse + params.entropy * 0.2, 0, 1));
    const dur = Math.random() > 0.6 ? '4n' : '2n';
    pad.triggerAttackRelease(Tone.Frequency(midi, 'midi').toNote(), dur, time, velocity);

    triOsc.frequency.setValueAtTime(Tone.Frequency(penta[Math.floor(Math.random() * penta.length)], 'midi').toFrequency(), time);
    triGain.gain.cancelScheduledValues(time);
    triGain.gain.setValueAtTime(0.001, time);
    triGain.gain.linearRampToValueAtTime(THREE.MathUtils.lerp(0.02, 0.12, params.entropy), time + 0.4);
    triGain.gain.linearRampToValueAtTime(0.001, time + 2.4);
  }, '1n');

  const textureLoop = new Tone.Loop((time) => {
    noiseGain.gain.cancelScheduledValues(time);
    noiseGain.gain.setValueAtTime(0.001, time);
    noiseGain.gain.linearRampToValueAtTime(THREE.MathUtils.lerp(0.015, 0.09, params.entropy), time + 0.08);
    noiseGain.gain.linearRampToValueAtTime(0.001, time + 0.8);
  }, '3n');

  const driftLoop = new Tone.Loop((time) => {
    const midi = bassDrift[Math.floor(Math.random() * bassDrift.length)];
    droneOsc.frequency.setValueAtTime(Tone.Frequency(midi, 'midi').toFrequency(), time);
  }, '10s');

  return {
    start() {
      Tone.Transport.bpm.value = params.tempo;
      pulseLoop.start(0);
      textureLoop.start(0);
      driftLoop.start(0);
      Tone.Transport.start('+0.05');
    },
    updateFromState() {
      const complexity = state.visualComplexity;
      Tone.Transport.bpm.rampTo(params.tempo, 0.35);
      reverbLine.wet.rampTo(THREE.MathUtils.lerp(0.35, 0.84, params.entropy), 0.4);
      reverbBass.wet.rampTo(THREE.MathUtils.lerp(0.18, 0.65, complexity), 0.5);
      reverbPerc.wet.rampTo(THREE.MathUtils.lerp(0.15, 0.48, params.entropy), 0.3);
      padFilter.frequency.rampTo(THREE.MathUtils.lerp(250, 2400, 1 - state.morph), 0.25);
      droneGain.gain.rampTo(THREE.MathUtils.lerp(0.02, 0.08, complexity * (1 - state.morph * 0.5)), 0.4);
      noiseGain.gain.rampTo(THREE.MathUtils.lerp(0.001, 0.07, params.entropy * state.pulse), 0.25);
      pulseLoop.interval = `${THREE.MathUtils.lerp(0.75, 1.6, 1 - complexity)}n`;
      textureLoop.interval = `${THREE.MathUtils.lerp(2.5, 5.5, 1 - params.entropy)}n`;
    },
  };
}

function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020306);

  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 280);
  camera.position.set(params.roomFt * 0.5 + 11, params.ceilingFt * 0.42, params.roomFt * 0.5 + 16);
  camera.lookAt(params.roomFt * 0.5, params.ceilingFt * 0.45, params.roomFt * 0.5);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.minDistance = 4;
  controls.maxDistance = 70;

  scene.add(new THREE.AmbientLight(0x546070, 0.13));

  const roomGroup = new THREE.Group();
  scene.add(roomGroup);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(params.roomFt * 1.35, params.roomFt * 1.35),
    new THREE.MeshStandardMaterial({
      color: 0x090a0e,
      roughness: 0.92,
      metalness: 0.05,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.42, 0.09);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const audioEngine = createAudioEngine();
  const animatedNodes = [];

  function clearVisuals() {
    while (animatedNodes.length) animatedNodes.pop();
    roomGroup.children.forEach((child) => {
      disposeNode(child);
      roomGroup.remove(child);
    });
  }

  function rebuildVisuals() {
    clearVisuals();
    if (visualMode.grid) {
      buildGridMeshes().forEach((m) => {
        animatedNodes.push({ mesh: m, type: 'grid' });
        roomGroup.add(m);
      });
    }
    if (visualMode.points) {
      const p = buildPointCloud();
      animatedNodes.push({ mesh: p, type: 'points' });
      roomGroup.add(p);
    }
    if (visualMode.boxes) {
      const b = buildTranslucentBoxes();
      animatedNodes.push({ mesh: b, type: 'boxes' });
      roomGroup.add(b);
    }
    if (visualMode.curves) {
      const c = buildCurves();
      animatedNodes.push({ mesh: c, type: 'curves' });
      roomGroup.add(c);
    }

    floor.geometry.dispose();
    floor.geometry = new THREE.PlaneGeometry(params.roomFt * 1.35, params.roomFt * 1.35);
    floor.position.set(params.roomFt / 2, 0, params.roomFt / 2);

    controls.target.set(params.roomFt * 0.5, params.ceilingFt * 0.42, params.roomFt * 0.5);
    camera.lookAt(controls.target);
    state.visualComplexity = clamp(activeVisualCount() / 4, 0.25, 1);
  }

  function randomizeScene() {
    params.roomFt = Math.round(randomIn(14, 38));
    params.ceilingFt = Math.round(randomIn(9, 22));
    params.gridDiv = Math.round(randomIn(8, 30));
    params.diameter = randomIn(0.25, 2.8);
    params.entropy = randomIn(0.1, 1);
    params.tempo = Math.round(randomIn(42, 112));

    visualMode.grid = Math.random() > 0.2;
    visualMode.points = Math.random() > 0.2;
    visualMode.boxes = Math.random() > 0.2;
    visualMode.curves = Math.random() > 0.2;
    if (activeVisualCount() === 0) {
      visualMode.grid = true;
    }
    syncUiFromParams();
    rebuildVisuals();
  }

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    bloom.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  const audioBtn = document.getElementById('audio-btn');
  audioBtn.addEventListener('click', async () => {
    if (state.audioReady) return;
    await Tone.start();
    audioEngine.start();
    state.audioReady = true;
    audioBtn.textContent = 'Audio Running';
    audioBtn.disabled = true;
  });

  const randomizeBtn = document.getElementById('randomize-btn');
  randomizeBtn.addEventListener('click', randomizeScene);

  const fieldDefs = [
    ['room-size', 'roomFt', (v) => parseInt(v, 10), (v) => String(v)],
    ['ceiling', 'ceilingFt', (v) => parseInt(v, 10), (v) => String(v)],
    ['grid-div', 'gridDiv', (v) => parseInt(v, 10), (v) => String(v)],
    ['diameter', 'diameter', (v) => parseFloat(v), (v) => v.toFixed(2)],
    ['entropy', 'entropy', (v) => parseFloat(v), (v) => v.toFixed(2)],
    ['tempo', 'tempo', (v) => parseInt(v, 10), (v) => String(v)],
  ];

  const checkDefs = [
    ['vis-grid', 'grid'],
    ['vis-points', 'points'],
    ['vis-boxes', 'boxes'],
    ['vis-curves', 'curves'],
  ];

  const fieldMap = {};
  function bindUi() {
    fieldDefs.forEach(([id, key, parse, fmt]) => {
      const input = document.getElementById(id);
      const valueEl = document.querySelector(`[data-value="${id}"]`);
      fieldMap[id] = { input, valueEl, key, fmt };
      input.addEventListener('input', () => {
        params[key] = parse(input.value);
        valueEl.textContent = fmt(params[key]);
        rebuildVisuals();
      });
      valueEl.textContent = fmt(params[key]);
    });

    checkDefs.forEach(([id, key]) => {
      const input = document.getElementById(id);
      input.checked = visualMode[key];
      input.addEventListener('change', () => {
        visualMode[key] = input.checked;
        if (activeVisualCount() === 0) {
          visualMode.grid = true;
          document.getElementById('vis-grid').checked = true;
        }
        rebuildVisuals();
      });
    });
  }

  function syncUiFromParams() {
    Object.entries(fieldMap).forEach(([id, cfg]) => {
      cfg.input.value = params[cfg.key];
      cfg.valueEl.textContent = cfg.fmt(params[cfg.key]);
      if (id === 'diameter' || id === 'entropy') {
        cfg.valueEl.textContent = Number(params[cfg.key]).toFixed(2);
      }
    });
    checkDefs.forEach(([id, key]) => {
      document.getElementById(id).checked = visualMode[key];
    });
  }

  bindUi();
  rebuildVisuals();

  const t0 = performance.now();
  function tick() {
    requestAnimationFrame(tick);
    const elapsed = (performance.now() - t0) * 0.001;
    const omega = (Math.PI * 2) / THREE.MathUtils.lerp(15, 3.8, params.tempo / 130);
    state.morph = (1 - Math.cos(elapsed * omega)) * 0.5;
    state.pulse = clamp(0.5 + Math.sin(elapsed * (0.55 + params.entropy * 1.7)) * 0.5, 0, 1);

    roomGroup.rotation.y = elapsed * THREE.MathUtils.lerp(0.01, 0.11, params.entropy) * 0.12;
    const shimmer = THREE.MathUtils.lerp(0.75, 1.35, state.pulse);
    animatedNodes.forEach(({ mesh, type }) => {
      if (type === 'grid') {
        mesh.material.emissiveIntensity = THREE.MathUtils.lerp(0.45, 2.2, state.pulse) * shimmer;
        mesh.material.opacity = THREE.MathUtils.lerp(0.35, 0.95, 1 - state.morph);
      } else if (type === 'points') {
        mesh.material.size = THREE.MathUtils.lerp(0.02, 0.16, params.diameter / 2.8) * shimmer;
        mesh.material.opacity = THREE.MathUtils.lerp(0.25, 0.95, state.pulse);
      } else if (type === 'boxes') {
        mesh.children.forEach((child, idx) => {
          child.rotation.y += 0.0006 * (idx % 4 + 1);
          child.material.emissiveIntensity = THREE.MathUtils.lerp(0.18, 1.2, state.pulse);
          child.material.opacity = THREE.MathUtils.lerp(0.12, 0.58, state.morph);
        });
      } else if (type === 'curves') {
        mesh.children.forEach((child) => {
          child.material.emissiveIntensity = THREE.MathUtils.lerp(0.2, 1.4, 1 - state.morph);
          child.material.opacity = THREE.MathUtils.lerp(0.18, 0.84, state.pulse);
        });
      }
    });

    bloom.strength = THREE.MathUtils.lerp(0.95, 0.25, state.morph * (1 - state.visualComplexity * 0.5));
    bloom.radius = THREE.MathUtils.lerp(0.32, 0.7, params.entropy * state.pulse);
    renderer.toneMappingExposure = THREE.MathUtils.lerp(0.95, 0.34, state.morph);

    if (state.audioReady) {
      audioEngine.updateFromState();
    }
    controls.update();
    composer.render();
  }

  tick();
}

init();
