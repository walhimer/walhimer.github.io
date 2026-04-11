/**
 * Mangle — minimal starter: Transport + looping Player + master record tap.
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

  const statusEl = document.getElementById("status");
  const btnStart = document.getElementById("btn-start");
  const btnPause = document.getElementById("btn-pause");
  const btnStop = document.getElementById("btn-stop");
  const btnRecord = document.getElementById("btn-record");
  const fileInput = document.getElementById("sample-file");

  const DEFAULT_SAMPLE =
    "https://tonejs.github.io/audio/casio/A1.mp3";

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

  async function loadSampleUrl(url) {
    setStatus("Loading sample…");
    buildGraph(url);
    await Tone.loaded();
    setStatus("Ready — press Start to play.");
  }

  btnStart.addEventListener("click", async () => {
    try {
      await ensureAudio();
      if (!player) {
        await loadSampleUrl(DEFAULT_SAMPLE);
      }
      Tone.Transport.start();
      setTransportButtons(true);
      setStatus("Playing.");
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

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      await ensureAudio();
      const url = URL.createObjectURL(file);
      await loadSampleUrl(url);
      e.target.value = "";
    } catch (err) {
      console.error(err);
      setStatus("Could not load that file.");
    }
  });
})();
