# Loop / Onland Requirements Checklist

Prepared for: Machine Aesthetic critique prep  
Concept target: Stationary building + moving layered technical landscape (background + foreground parallax)

---

## A) Format and pipeline requirements

- [ ] Export architecture assets as `.glb` (or `.gltf` where accepted in XR Creator)
- [ ] Keep source scene split into reusable layers:
  - [ ] static building shell
  - [ ] background layer(s) that move
  - [ ] foreground layer(s) that move
  - [ ] interior gallery objects
- [ ] Use Blender conversion when coming from non-glTF tools

Sources:
- https://docs.loop.onland.io/Metaverse-docs/faqs
- https://docs.loop.onland.io/xr-creator/faqs

---

## B) Size and performance constraints

- [ ] Target low-poly meshes and optimized textures
- [ ] Keep project comfortably under 128MB total
- [ ] Keep individual uploads conservative (<=50MB preferred when using Archive)
- [ ] Validate in Scene Health Check before publishing

Conflicting public limits appear in docs (50MB, 128MB, 150MB). Use strict budgeting.

Sources:
- https://docs.loop.onland.io/xr-creator/faqs
- https://docs.loop.onland.io/archive/
- https://docs.loop.onland.io/troubleshooting

---

## C) Scene construction requirements in XR Creator

- [ ] Build the world in XR Creator Studio (web editor)
- [ ] Use Hierarchy panel to maintain clean parent/child organization
- [ ] Keep building root transform stationary
- [ ] Animate only layer objects for parallax effect
- [ ] Use object properties for collidable/visibility/shadow tuning
- [ ] Optional: use Media Frames / Snap Colliders for in-building artwork displays

Sources:
- https://docs.loop.onland.io/xr-creator/hierarchy-properties
- https://docs.loop.onland.io/xr-creator/snap-and-media-frames
- https://docs.loop.onland.io/category/xr-creator-studio

---

## D) Interactivity and scripting requirements (if needed)

- [ ] Add Behavior scripts only where necessary
- [ ] Use lifecycle hooks:
  - [ ] startup
  - [ ] update
  - [ ] dispose
- [ ] Use executionIndex strategy if layer timing order matters
- [ ] Use import/export pragmas for modular scripts

Sources:
- https://docs.loop.onland.io/Advance%20Documentation/getting-started
- https://docs.loop.onland.io/Advance%20Documentation/lifecycle-hooks
- https://docs.loop.onland.io/Advance%20Documentation/execution-behaviours
- https://docs.loop.onland.io/Advance%20Documentation/sharing-data

---

## E) Verse publishing and runtime requirements

- [ ] Publish via Launch > Deploy to Metaverse
- [ ] Review scene health/performance report
- [ ] Configure Verse settings:
  - [ ] capacity
  - [ ] permissions
  - [ ] privacy mode (shared/trustworthy)
  - [ ] optional portal routing
- [ ] Test on desktop + mobile target

Sources:
- https://docs.loop.onland.io/xr-creator/faqs
- https://docs.loop.onland.io/Metaverse-docs/verse-settings
- https://docs.loop.onland.io/Metaverse-docs/faqs

---

## F) Concept-specific implementation constraints (your stated vision)

- [ ] Building remains physically stationary in world coordinates
- [ ] Background technical drawing layers move behind building
- [ ] Foreground technical drawing layers move in front of building
- [ ] Entry transition into building (trigger point or portal)
- [ ] Interior contains additional artworks as separate nodes/zones
- [ ] Maintain readability and avoid overdraw on mobile

---

## G) Questions to confirm with Loop/Onland team in critique

- [ ] Current enforced file-size limits per file and per project
- [ ] Recommended triangle count / texture budgets for cross-device support
- [ ] Best practice for layered parallax animation (script vs animation tracks)
- [ ] Any constraints for multi-room interior portals and nested media

