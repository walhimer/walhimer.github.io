/**
 * Mangle ù Loop mode OR Bloom-style pulsed pentatonic bank (Bloom Four Wallsùlike).
 */
(function () {
  "use strict";

  /** @type {Tone.Player | null} */
  let player = null;
  /** @type {Tone.Players | null} */
  let playersObj = null;
  /** @type {Tone.Loop | null} */
  let bloomLoop = null;
  /** shuffled bank indices for bloom */
  let bloomOrder = [];
  let bloomStep = 0;

  /** @type {Tone.Gain | null} */
  let master = null;
  /** @type {Tone.Recorder | null} */
  let recorder = null;

  let audioReady = false;
  let recording = false;

  /** @type {string[]} */
  let bankBlobUrls = [];
  const bank = { urls: /** @type {string[]} */ ([]), names: /** @type {string[]} */ ([]) };

  const statusEl = document.getElementById("status");
  const btnStart = document.getElementById("btn-start");
  const btnPause = document.getElementById("btn-pause");
  const btnStop = document.getElementById("btn-stop");
  const btnRecord = document.getElementById("btn-record");
  const fileInput = document.getElementById("sample-file");
  const folderInput = document.getElementById("sample-folder");
  const bankSelect = document.getElementById("sample-bank");
  const pulseInput = document.getElementById("pulse-interval");
  const pulseLabel = document.getElementById("pulse-label");
  const pentatonicOnly = document.getElementById("pentatonic-only");
  const bankWrap = document.getElementById("bank-wrap");

  const DEFAULT_SAMPLE =
    "https://tonejs.github.io/audio/casio/A1.mp3";

  const AUDIO_EXT = /\.(wav|mp3|flac|aiff|aif|ogg|m4a)$/i;

  const PENTA_LETTERS = new Set(["C", "D", "E", "G", "A"]);

  function getMode() {
    const el = document.querySelector('input[name="mode"]:checked');
    return el && el.value === "bloom" ? "bloom" : "loop";
  }

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  function setTransportButtons(playing) {
    btnStart.disabled = playing;
    btnPause.disabled = !playing;
    btnStop.disabled = !playing;
  }

  async function ensureAudio() {
    if (audioReady) return;
    await Tone.start();
    audioReady = true;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  /** e.g. 448532__tedagame__c5.ogg or C4.ogg ? C, 5 */
  function extractNoteFromFilename(name) {
    const matches = name.match(/([A-Ga-g])(\d+)/g);
    if (!matches || !matches.length) return null;
    const last = matches[matches.length - 1];
    const m = last.match(/([A-Ga-g])(\d+)/i);
    if (!m) return null;
    return { letter: m[1].toUpperCase(), oct: parseInt(m[2], 10) };
  }

  function getBloomIndices() {
    const onlyPenta = pentatonicOnly.checked;
    const n = bank.urls.length;
    const out = [];
    for (let i = 0; i < n; i++) {
      if (!onlyPenta) {
        out.push(i);
        continue;
      }
      const ex = extractNoteFromFilename(bank.names[i]);
      if (ex && PENTA_LETTERS.has(ex.letter)) {
        out.push(i);
      }
    }
    return out.length ? out : bank.urls.map((_, i) => i);
  }

  function revokeBank() {
    bankBlobUrls.forEach((u) => URL.revokeObjectURL(u));
    bankBlobUrls = [];
    bank.urls = [];
    bank.names = [];
    bankSelect.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "ù Load a folder or file ù";
    bankSelect.appendChild(opt);
    bankSelect.disabled = true;
    bankSelect.value = "";
  }

  function fillBankFromFiles(files) {
    revokeBank();
    const audioFiles = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (AUDIO_EXT.test(f.name)) {
        audioFiles.push(f);
      }
    }
    audioFiles.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );
    if (!audioFiles.length) {
      setStatus("No audio files in that folder (.wav, .mp3, .ogg, ù).");
      return;
    }
    audioFiles.forEach((f) => {
      const url = URL.createObjectURL(f);
      bankBlobUrls.push(url);
      bank.urls.push(url);
      bank.names.push(f.name);
      const opt = document.createElement("option");
      opt.value = String(bank.urls.length - 1);
      opt.textContent = f.name;
      bankSelect.appendChild(opt);
    });
    bankSelect.disabled = false;
    bankSelect.selectedIndex = 1;
    setStatus(audioFiles.length + " files loaded ù Loop: pick one; Garden pulse: Start (needs samples).");
  }

  function disposeBloom() {
    if (bloomLoop) {
      try {
        bloomLoop.stop(0);
        bloomLoop.dispose();
      } catch (e) {
        console.warn(e);
      }
      bloomLoop = null;
    }
    if (playersObj) {
      try {
        playersObj.dispose();
      } catch (e) {
        console.warn(e);
      }
      playersObj = null;
    }
    bloomOrder = [];
    bloomStep = 0;
  }

  function disposeAllGraph() {
    disposeBloom();
    if (player) {
      try {
        player.dispose();
      } catch (e) {
        console.warn(e);
      }
      player = null;
    }
    if (master) {
      try {
        master.dispose();
      } catch (e) {
        console.warn(e);
      }
      master = null;
    }
    if (recorder) {
      try {
        recorder.dispose();
      } catch (e) {
        console.warn(e);
      }
      recorder = null;
    }
  }

  function buildLoopGraph(url) {
    disposeAllGraph();

    master = new Tone.Gain(1);
    master.toDestination();

    recorder = new Tone.Recorder();
    master.connect(recorder);

    player = new Tone.Player({
      url,
      loop: true,
      onerror: (e) => {
        console.error(e);
        setStatus(
          "Could not load audio. Try another file or check the network for the demo sample."
        );
      },
    });
    player.connect(master);
    player.sync().start(0);
  }

  async function buildBloomGraph() {
    disposeAllGraph();
    const indices = getBloomIndices();
    if (!indices.length) {
      throw new Error("No samples for Garden pulse.");
    }

    bloomOrder = shuffle(indices);
    bloomStep = 0;

    const urls = {};
    for (let k = 0; k < bank.urls.length; k++) {
      urls["s" + k] = bank.urls[k];
    }

    master = new Tone.Gain(0.85);
    master.toDestination();

    recorder = new Tone.Recorder();
    master.connect(recorder);

    playersObj = new Tone.Players({
      urls,
      fadeOut: 0.06,
      onerror: (e) => console.error(e),
    }).connect(master);

    await Tone.loaded();

    const sec = parseFloat(pulseInput.value) || 1.8;
    const interval = sec + "s";

    bloomLoop = new Tone.Loop(function (time) {
      if (!playersObj || !bloomOrder.length) return;
      const bankIdx = bloomOrder[bloomStep % bloomOrder.length];
      bloomStep += 1;
      const pl = playersObj.player("s" + bankIdx);
      pl.volume.value = -16 + Math.random() * 9;
      pl.start(time);
    }, interval);

    bloomLoop.start(0);
  }

  async function loadSampleUrl(url, opts) {
    const silent = opts && opts.silent;
    if (!silent) {
      setStatus("Loading sampleù");
    }
    Tone.Transport.stop(0);
    setTransportButtons(false);
    btnStart.disabled = false;
    buildLoopGraph(url);
    await Tone.loaded();
    if (!silent) {
      setStatus("Ready ù press Start to play.");
    }
  }

  async function switchToBankIndex(index) {
    const url = bank.urls[index];
    if (url == null) return;
    const wasPlaying = Tone.Transport.state === "started";
    if (wasPlaying) {
      Tone.Transport.pause();
      setTransportButtons(false);
      btnStart.disabled = false;
    }
    await loadSampleUrl(url, { silent: true });
    if (wasPlaying) {
      Tone.Transport.start();
      setTransportButtons(true);
      setStatus("Playing: " + (bank.names[index] || ""));
    } else {
      setStatus("Loaded: " + (bank.names[index] || "") + " ù press Start.");
    }
  }

  function syncModeUi() {
    const bloom = getMode() === "bloom";
    bankWrap.style.opacity = bloom ? "0.45" : "1";
    bankSelect.disabled = bloom || bank.urls.length === 0;
    pulseInput.disabled = !bloom;
    pentatonicOnly.disabled = !bloom;
  }

  document.querySelectorAll('input[name="mode"]').forEach(function (r) {
    r.addEventListener("change", syncModeUi);
  });

  pulseInput.addEventListener("input", function () {
    pulseLabel.textContent = pulseInput.value;
  });

  btnStart.addEventListener("click", async () => {
    try {
      await ensureAudio();
      const mode = getMode();

      if (mode === "bloom") {
        if (!bank.urls.length) {
          setStatus("Garden pulse needs your samples ù load a folder (e.g. pentatonic piano).");
          return;
        }
        Tone.Transport.stop(0);
        setTransportButtons(false);
        btnStart.disabled = false;
        setStatus("Loading Garden pulseù");
        await buildBloomGraph();
        Tone.Transport.start();
        setTransportButtons(true);
        setStatus(
          "Garden pulse ù " +
            bloomOrder.length +
            " steps, " +
            pulseInput.value +
            "s (Bloom / sketch-style beat)."
        );
        return;
      }

      if (!player) {
        await loadSampleUrl(DEFAULT_SAMPLE);
      }
      Tone.Transport.start();
      setTransportButtons(true);
      const idx = parseInt(bankSelect.value, 10);
      const name =
        !Number.isNaN(idx) && bank.names[idx] != null
          ? bank.names[idx]
          : "";
      setStatus(name ? "Playing (loop): " + name : "Playing.");
    } catch (err) {
      console.error(err);
      setStatus("Error starting audio. Check the console.");
    }
  });

  btnPause.addEventListener("click", () => {
    if (!audioReady) return;
    if (!player && !playersObj) return;
    Tone.Transport.pause();
    setTransportButtons(false);
    btnStart.disabled = false;
    setStatus("Paused.");
  });

  btnStop.addEventListener("click", () => {
    if (!audioReady) return;
    if (!player && !playersObj) return;
    Tone.Transport.stop(0);
    if (bloomLoop) {
      bloomLoop.stop(0);
    }
    setTransportButtons(false);
    btnStart.disabled = false;
    setStatus("Stopped.");
  });

  btnRecord.addEventListener("click", async () => {
    try {
      await ensureAudio();
      if (!recorder) {
        setStatus("Press Start once (or load a file) so the audio path exists ù then record.");
        return;
      }

      if (!recording) {
        await recorder.start();
        recording = true;
        btnRecord.textContent = "Stop recording";
        btnRecord.classList.add("recording");
        const playing =
          Tone.Transport.state === "started" && (!!player || !!playersObj);
        setStatus(
          playing
            ? "Playing ù recordingù"
            : "Recording (silent until you Start)ù"
        );
      } else {
        const blob = await recorder.stop();
        recording = false;
        btnRecord.textContent = "Record";
        btnRecord.classList.remove("recording");

        const ext = blob.type.includes("wav") ? "wav" : "webm";
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "mangle-recording." + ext;
        a.click();
        URL.revokeObjectURL(a.href);

        setStatus("Recording saved. Still playing? Use Pause / Stop as needed.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Recording failed ù see console.");
      recording = false;
      btnRecord.textContent = "Record";
      btnRecord.classList.remove("recording");
    }
  });

  folderInput.addEventListener("change", async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    try {
      await ensureAudio();
      fillBankFromFiles(files);
      if (bank.urls.length && getMode() === "loop") {
        await loadSampleUrl(bank.urls[0], { silent: true });
      }
      e.target.value = "";
      syncModeUi();
    } catch (err) {
      console.error(err);
      setStatus("Could not load that folder.");
    }
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      await ensureAudio();
      revokeBank();
      const url = URL.createObjectURL(file);
      bankBlobUrls.push(url);
      bank.urls.push(url);
      bank.names.push(file.name);
      const opt = document.createElement("option");
      opt.value = "0";
      opt.textContent = file.name;
      bankSelect.appendChild(opt);
      bankSelect.disabled = false;
      bankSelect.value = "0";
      await loadSampleUrl(url);
      e.target.value = "";
      syncModeUi();
    } catch (err) {
      console.error(err);
      setStatus("Could not load that file.");
    }
  });

  bankSelect.addEventListener("change", async () => {
    const v = bankSelect.value;
    if (v === "" || bank.urls.length === 0) return;
    const idx = parseInt(v, 10);
    if (Number.isNaN(idx) || !bank.urls[idx]) return;
    try {
      await ensureAudio();
      await switchToBankIndex(idx);
    } catch (err) {
      console.error(err);
      setStatus("Could not switch sample.");
    }
  });

  syncModeUi();
})();
