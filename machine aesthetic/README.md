# Machine Aesthetic

This folder contains four source files that together define the `Machine Aesthetic` artwork direction.

## Files

- `machine-aesthetic.html`  
  Core concept text and system framing: one codebase across digital, object, and spatial dimensions.
- `bloom-four-walls-cathedral.html`  
  Four-wall room work with lifecycle behavior, audio, and immersive spatial navigation.
- `technical-drawing-with-elevation-2.html`  
  Procedural technical drawing system with timed drawing progression and audio triggering.
- `walk_moon_audio_standalone.html`  
  Walk/moon/audio generative piece with seeded identity and lifetime-to-eternity framing.

## Artwork Intent

These four works are being treated as components of one larger artwork:

- Live digital work for Loop / `looponland.io`
- Object form on an LED panel
- Spatial installation as a room-scale organism

The unifying principle is code fidelity: the code is the artwork, and each context is a different embodiment of the same system.

## Required Technical Alignment

All files in this folder should align to the same canonical control stack:

- **EmergentDNA (canonical genome layer)**  
  Use the shared seeded DNA/RNG model from [walhimer-studio/EmergentDNA](https://github.com/walhimer-studio/EmergentDNA).
- **Light Art OSC (shared room control contract)**  
  Use the shared parameter and transport model from [studio/light-art-osc](https://github.com/walhimer-studio/walhimer.github.io/tree/main/studio/light-art-osc).
- **Shared sliders as one control surface**  
  Slider/parameter controls should map to one normalized state model across all pieces rather than separate per-file control logic.

## Notes

- This folder is prepared as a push-ready package for GitHub.
- Keep filenames stable unless routing/links are updated together.
