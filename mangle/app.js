/**
 * Mangle — Transport + looping Player + bank (folder or single file) + record tap.
 */
(function () {
  "use strict";

  /** @type {Tone.Player | null} */
  let player = null;
  /** @type {Tone.Gain | null} */
  let master = null;
  /** @type {Tone.Recorder | null} */
  let recorder = null;

  let audioReady = false;
  let recording = false;

  /** @type {string[]} */
  let bankBlobUrls = [];
  /** parallel to select options: same order */
  const bank = { urls: /** @type {string[]} */ ([]), names: /** @type {string[]} */ ([]) };

  const statusEl = document.getElementById("status");
  const btnStart = document.getElementById("btn-start");
  const btnPause = document.getElementById("btn-pause");
  const btnStop = document.getElementById("btn-stop");
  const btnRecord = document.getElementById("btn-record");
  const fileInput = document.getElementById("sample-file");
  const folderInput = document.getElementById("sample-folder");
  const bankSelect = document.getElementById("sample-bank");

  const DEFAULT_SAMPLE =
    "https://tonejs.github.io/audio/casio/A1.mp3";

  const AUDIO_EXT = /\.(wav|mp3|flac|aiff|aif|ogg|m4a)$/i;

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

  function revokeBank() {
    bankBlobUrls.forEach((u) => URL.revokeObjectURL(u));
    bankBlobUrls = [];
    bank.urls = [];
    bank.names = [];
    bankSelect.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "— Load a folder or file —";
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
      setStatus("No audio files in that folder (.wav, .mp3, .ogg, …).");
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
    setStatus(audioFiles.length + " files loaded — pick one above, then Start.");
  }

  function buildGraph(url) {
    Tone.Transport.stop(0);
    setTransportButtons(false);
    btnStart.disabled = false;

    if (player) {
      player.dispose();
      player = null;
    }
    if (master) {
      master.dispose();
      master = null;
    }
    if (recorder) {
      recorder.dispose();
      recorder = null;
    }

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

  async function loadSampleUrl(url, opts) {
    const silent = opts && opts.silent;
    if (!silent) {
      setStatus("Loading sample…");
    }
    buildGraph(url);
    await Tone.loaded();
    if (!silent) {
      setStatus("Ready — press Start to play.");
    }
  }

  /** Switch the looping sample; keeps transport running if it was playing. */
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
      setStatus("Loaded: " + (bank.names[index] || "") + " — press Start.");
    }
  }

  btnStart.addEventListener("click", async () => {
    try {
      await ensureAudio();
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
      setStatus(name ? "Playing: " + name : "Playing.");
    } catch (err) {
      console.error(err);
      setStatus("Error starting audio. Check the console.");
    }
  });

  btnPause.addEventListener("click", () => {
    if (!audioReady || !player) return;
    Tone.Transport.pause();
    setTransportButtons(false);
    btnStart.disabled = false;
    setStatus("Paused.");
  });

  btnStop.addEventListener("click", () => {
    if (!audioReady || !player) return;
    Tone.Transport.stop(0);
    setTransportButtons(false);
    btnStart.disabled = false;
    setStatus("Stopped.");
  });

  btnRecord.addEventListener("click", async () => {
    try {
      await ensureAudio();
      if (!recorder) {
        setStatus("Press Start once (or load a file) so the audio path exists — then record.");
        return;
      }

      if (!recording) {
        await recorder.start();
        recording = true;
        btnRecord.textContent = "Stop recording";
        btnRecord.classList.add("recording");
        setStatus(
          player && Tone.Transport.state === "started"
            ? "Playing — recording…"
            : "Recording (silent until you Start)…"
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
      setStatus("Recording failed — see console.");
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
      if (bank.urls.length) {
        await loadSampleUrl(bank.urls[0], { silent: true });
      }
      e.target.value = "";
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
})();
