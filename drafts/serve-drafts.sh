#!/usr/bin/env sh
# Serves this folder over HTTP so the merge draft can embed Bloom live (iframe).
# Opening the HTML via file:// uses a screenshot + link instead (browser limits).
cd "$(dirname "$0")"
echo "Drafts (local HTTP): http://localhost:8765/"
echo "  Cathedral merge (seven artworks in carousel):"
echo "    http://localhost:8765/homepage-cathedral-merge-local-draft.html"
echo "  Bloom sketch only:"
echo "    http://localhost:8765/bloom-four-walls-sketch.html"
echo "  Light Art 023 (draft copy):"
echo "    http://localhost:8765/artwork-02-light-art-023/index.html"
echo "  Technical drawing + elevation (draft):"
echo "    http://localhost:8765/artwork-03-technical-drawing-elevation/index.html"
echo "  Technical drawing studio (draft):"
echo "    http://localhost:8765/artwork-04-technical-drawing/index.html"
echo "  Window 93 — corner projection (draft):"
echo "    http://localhost:8765/artwork-05-window-93/index.html"
echo "  923 centered — gradient planes (draft):"
echo "    http://localhost:8765/artwork-06-923-centered/index.html"
echo "  Traveling Landscape — Emergent DNA (piano) (draft):"
echo "    http://localhost:8765/traveling-landscape-emergent-dna/flying_boxes_emergent_dna_w_piano.html"
echo "Optional: ?static=1 on the merge URL forces the screenshot; ?live=1 forces embed (file:// may still fail)."
echo "Press Ctrl+C to stop."
exec python3 -m http.server 8765
