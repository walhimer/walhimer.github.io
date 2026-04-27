# Onland / Loop Docs Capture

Captured on: 2026-04-26  
Primary source: https://docs.loop.onland.io/

This file is a local capture of the key documentation pages relevant to building and publishing Loop/Onland work.

---

## 1) Platform overview

- Welcome: https://docs.loop.onland.io/
- Describes three core components:
  - XRHUB (management dashboard)
  - XR Creator Studio (web-based XR editor)
  - Verses (published runtime apps)

---

## 2) Import, formats, limits, and media support

### Metaverse FAQs
Source: https://docs.loop.onland.io/Metaverse-docs/faqs

- 3D model import support: `.glb` (glTF binary)
- If your tool does not export `.glb`, convert via Blender
- Video support:
  - Standard video formats
  - HLS for live streaming
- Supported presentation/media in Verses include:
  - PDF
  - Images
  - 3D models
  - Audio
  - Video
  - Webcam input
  - Screen sharing
- Participant capacity guidance:
  - Hard limit mentioned: 50
  - Recommended in-Verse participants: 25 for performance

### XR Creator FAQs
Source: https://docs.loop.onland.io/xr-creator/faqs

- Supported formats in editor:
  - 3D: `.glb`, `.gltf`
  - Images/video: `.jpg`, `.png`, `.mp4`
  - Audio: `.mp3`
  - Docs: `.pdf`
- Publish flow:
  - Launch > Deploy to Metaverse
  - Scene Health Check + performance report
- Size guidance:
  - Entire project must be under 128MB

### Archive app docs
Source: https://docs.loop.onland.io/archive/

- Archive supports file types:
  - GLB, PNG, JPG, GIF, PDF, MP4, MP3
- Maximum file size stated here:
  - 50MB (per uploaded file in Archive)

### 2D Elements docs
Source: https://docs.loop.onland.io/xr-creator/2d-elements

- Assets tab supports:
  - `.png`, `.jpg`, `.gif`, `.mp4`, `.mp3`, `.pdf`
- Archive upload pathways and metadata types:
  - File
  - Digital Art
  - Digital Twin Art
- Image/video can be used as portals via Link Href
- 360 image projection support (equirectangular)

### Troubleshooting
Source: https://docs.loop.onland.io/troubleshooting

- Broken media guidance mentions checking file size under 150MB
- Note: this conflicts with other pages (50MB Archive file cap, 128MB project cap)

---

## 3) Verse operation, permissions, and moderation

### Verse settings
Source: https://docs.loop.onland.io/Metaverse-docs/verse-settings

- Capacity settings:
  - Up to 50 users per Verse
  - Default listed as 30 for performance
  - Lobby supports additional observers
- Privacy modes:
  - Shared Link
  - Trustworthy (invite-based)
- Moderator controls:
  - Object creation/movement
  - Camera creation
  - Pinning
  - Drawing/emojis
  - Flying
  - Chat/voice restriction
- Advanced:
  - Leave URL redirect
  - Entry redirect to another Verse
  - FOV adjustment
  - Tour portals
  - Added portals
  - Streamer Mode (lobby cast)

---

## 4) XR Creator workspace and object setup

### Controls
Source: https://docs.loop.onland.io/xr-creator/Creator-controls

- Navigation/editing shortcuts:
  - T (move), R (rotate), Y (scale), F (focus)
  - Save: Cmd/Ctrl+S
  - Publish: Cmd/Ctrl+Alt+P
  - Preview: Cmd/Ctrl+Shift+P

### Hierarchy & Properties
Source: https://docs.loop.onland.io/xr-creator/hierarchy-properties

- Hierarchy:
  - reorder
  - reparent
  - group
  - drag/drop imports
- Properties:
  - transform, visibility, collisions, shadows
  - object-specific controls for lights/models/media

### Media Frames & Snap Colliders
Source: https://docs.loop.onland.io/xr-creator/snap-and-media-frames

- Media Frames support display of:
  - images
  - videos
  - PDFs
  - external web content
  - 3D objects
- Snap Colliders define larger snapping zones for layout/exhibition structures

---

## 5) Scripting and developer docs

### For Developers category
Source: https://docs.loop.onland.io/category/for-developers

Key pages:
- Writing first script: https://docs.loop.onland.io/Advance%20Documentation/getting-started
- Lifecycle hooks: https://docs.loop.onland.io/Advance%20Documentation/lifecycle-hooks
- Execution order: https://docs.loop.onland.io/Advance%20Documentation/execution-behaviours
- Sharing data: https://docs.loop.onland.io/Advance%20Documentation/sharing-data
- Dynamic imports: https://docs.loop.onland.io/Advance%20Documentation/dynamic-import
- Conditional compilation: https://docs.loop.onland.io/Advance%20Documentation/condtional-compilation

Highlights:
- Behavior component as scripting unit
- Lifecycle: startup / update / dispose
- Pragmas for lifecycle, import/export, compile flags
- Sandboxed JS subset + GLSL support in scripting context
- Dynamic import from URLs using pragma import syntax

### Persistable API
Source: https://docs.loop.onland.io/xr-creator/scripting-api/persistable_class_docs

- `Persistable.use(name)` object-scoped persistence
- core methods:
  - inspect/get/set/delete/clear
  - numeric ops: inc/mult
  - array ops: arrPush/arrInsertAt/arrPull/arrPullAt
  - lock/unlock
  - ttl
  - drop

---

## 6) AI Agent docs (optional to this build path)

Source: https://docs.loop.onland.io/xr-creator/AI-Agent

- Supports Azure AI completion, OpenAI completion, and OpenAI assistant workflows
- Properties include:
  - voice mode
  - proximity range
  - enter/leave prompts
  - event emission hooks

---

## 7) XR Creator category index pages captured

- XR Creator Studio category: https://docs.loop.onland.io/category/xr-creator-studio
- Version Control category: https://docs.loop.onland.io/category/version-control
  - overview: https://docs.loop.onland.io/xr-creator/version-control
  - team workflows: https://docs.loop.onland.io/xr-creator/version-control-team

---

## Notes on conflicting limits

Different pages mention different size limits:

- 50MB (Archive file upload guidance)
- 128MB (XR Creator FAQ project size guidance)
- 150MB (Troubleshooting broken media note)

For production planning, use the strictest practical constraints and verify current enforcement in your account's Scene Health Check and upload dialogs.

