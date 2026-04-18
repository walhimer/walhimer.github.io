/**
 * Tedagame C-major sample set (.ogg) — local files under audio/tedagame-pentatonic/
 * (not Salamander; sourced from Mangle-samples / tedagame-c-major-pentatonic)
 */
(function (global) {
  'use strict';

  var piano = null;
  var loadPromise = null;
  var BASE = new URL('audio/tedagame-pentatonic/', global.location.href).href;

  function loadPiano() {
    if (loadPromise) return loadPromise;
    if (typeof Tone === 'undefined') {
      loadPromise = Promise.resolve(null);
      return loadPromise;
    }
    loadPromise = Tone.start().then(function () {
      return new Promise(function (resolve) {
        piano = new Tone.Sampler({
          urls: {
            C3: 'C3.ogg',
            D3: 'D3.ogg',
            E3: 'E3.ogg',
            G3: 'G3.ogg',
            A3: 'A3.ogg',
            C4: 'C4.ogg',
            D4: 'D4.ogg',
            E4: 'E4.ogg',
            G4: 'G4.ogg',
            A4: 'A4.ogg'
          },
          release: 2.5,
          baseUrl: BASE,
          onload: function () {
            Tone.getDestination().volume.value = -10;
            resolve(piano);
          }
        }).toDestination();
      });
    });
    return loadPromise;
  }

  /** Call from first user gesture so Tone can start and buffers can load. */
  function preload() {
    return loadPiano();
  }

  global.playNote = function (noteName, velocity) {
    loadPiano().then(function (p) {
      if (!p) return;
      var vel = typeof velocity === 'number' ? velocity : 0.2;
      p.triggerAttackRelease(noteName, '16n', Tone.now(), vel);
    });
  };

  global.VisiblePiano = { preload: preload, loadPiano: loadPiano };
})(typeof window !== 'undefined' ? window : this);
