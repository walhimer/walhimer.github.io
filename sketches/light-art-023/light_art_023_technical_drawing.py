#!/usr/bin/env python3
"""
Light Art 023 — technical drawing (plan + elevation schematic).

Room: 20′ × 20′ footprint, 12′ ceiling — matches `main.js` (1 unit = 1 foot).
A4 landscape; centered viewBox. Optional THUMBNAILS (empty = none).

Usage:
  python3 light_art_023_technical_drawing.py
  python3 light_art_023_technical_drawing.py -o ./light_art_023_technical_drawing.svg
"""

from __future__ import annotations

import argparse
from pathlib import Path
import xml.etree.ElementTree as ET

ARTIST = "Mark Walhimer"
ART_YEAR = "2026"
STUDIO = "Walhimer Studio"
STUDIO_URL = "https://mark-walhimer.com"
MATERIALS = (
    "LED linear elements, DMX / programmable lighting controller, "
    "aluminum or steel suspension & raceway, power distribution"
)
NTS_LINE = "NTS — NOT TO SCALE"
MOCKUP_NOTE = "Artist requests full-size mockup prior to fabrication."

THUMBNAILS = ()

THUMB_W = 360.0
THUMB_H = 360.0
THUMB_GAP = 20.0

A4_LANDSCAPE_W_MM = 297.0
A4_LANDSCAPE_H_MM = 210.0

ROOM_W_FT = 20.0
ROOM_D_FT = 20.0
CEILING_FT = 12.0
GRID_DIV = 20


def viewbox_a4_landscape_centered(content_w: float, content_h: float) -> tuple[float, float, float, float]:
    pa = A4_LANDSCAPE_W_MM / A4_LANDSCAPE_H_MM
    vb_w = max(content_w, content_h * pa)
    vb_h = vb_w / pa
    if vb_h < content_h:
        vb_h = content_h
        vb_w = vb_h * pa
    vb_x = content_w / 2.0 - vb_w / 2.0
    vb_y = content_h / 2.0 - vb_h / 2.0
    return vb_x, vb_y, vb_w, vb_h


def build_svg(px_per_ft: float = 28.0) -> ET.Element:
    margin = 22.0
    m = margin

    plan_w = ROOM_W_FT * px_per_ft
    plan_h = ROOM_D_FT * px_per_ft
    elev_w = ROOM_W_FT * px_per_ft
    elev_h = CEILING_FT * px_per_ft
    gap = 36.0
    title_h = 182.0

    w = m + plan_w + gap + elev_w + m
    h = m + max(plan_h, elev_h) + gap + title_h + m

    vb_x, vb_y, vb_w, vb_h = viewbox_a4_landscape_centered(w, h)

    svg = ET.Element(
        "svg",
        {
            "xmlns": "http://www.w3.org/2000/svg",
            "width": f"{A4_LANDSCAPE_W_MM}mm",
            "height": f"{A4_LANDSCAPE_H_MM}mm",
            "viewBox": f"{vb_x:.2f} {vb_y:.2f} {vb_w:.2f} {vb_h:.2f}",
            "preserveAspectRatio": "xMidYMid meet",
        },
    )

    ET.SubElement(svg, "defs")
    ET.SubElement(svg, "title").text = (
        f"Light Art 023 — {ARTIST}, {ART_YEAR} — {STUDIO} — technical plan / elevation"
    )
    ET.SubElement(svg, "desc").text = (
        f"Light Art 023 by {ARTIST} ({ART_YEAR}), {STUDIO} ({STUDIO_URL}). "
        f"Room {ROOM_W_FT:.0f}′×{ROOM_D_FT:.0f}′, ceiling {CEILING_FT:.0f}′. {MATERIALS}. "
        f"{NTS_LINE}. {MOCKUP_NOTE} Schematic grid — not every luminaire shown."
    )

    styles = ET.SubElement(svg, "style")
    styles.text = """
      .text { font-family: system-ui, "Helvetica Neue", sans-serif; fill: #111; }
      .title { font-size: 14px; font-weight: 600; }
      .meta { font-size: 10px; fill: #333; }
      .nts { font-size: 11px; font-weight: 600; fill: #111; }
      .dim { stroke: #333; stroke-width: 0.55; fill: none; }
      .dim-help { stroke: #666; stroke-width: 0.35; stroke-dasharray: 4 3; fill: none; }
      .dim-text { font-size: 11px; fill: #111; }
      .room { fill: none; stroke: #111; stroke-width: 1.2; }
      .grid { stroke: #999; stroke-width: 0.35; }
      .elev { fill: none; stroke: #111; stroke-width: 1.0; }
      .ceiling { stroke: #666; stroke-width: 0.6; stroke-dasharray: 4 3; }
      .page { fill: #ffffff; stroke: none; }
      .thumb-cap { font-size: 11px; fill: #333; }
      .thumb-head { font-size: 12px; font-weight: 600; fill: #111; }
    """

    defs = svg.find("defs")
    assert defs is not None
    arrow = ET.SubElement(
        defs,
        "marker",
        {
            "id": "arrow",
            "markerWidth": "6",
            "markerHeight": "6",
            "refX": "5",
            "refY": "3",
            "orient": "auto",
        },
    )
    ET.SubElement(arrow, "path", {"d": "M0,0 L6,3 L0,6 L1.5,3 z", "fill": "#333"})

    ET.SubElement(
        svg,
        "rect",
        {
            "x": f"{vb_x:.2f}",
            "y": f"{vb_y:.2f}",
            "width": f"{vb_w:.2f}",
            "height": f"{vb_h:.2f}",
            "class": "page",
        },
    )

    px = m
    py = m

    g_plan = ET.SubElement(svg, "g", {"id": "plan"})
    ET.SubElement(
        g_plan,
        "rect",
        {"x": str(px), "y": str(py), "width": str(plan_w), "height": str(plan_h), "class": "room"},
    )
    for i in range(GRID_DIV + 1):
        x = px + (i / GRID_DIV) * plan_w
        ET.SubElement(
            g_plan,
            "line",
            {
                "x1": str(x),
                "y1": str(py),
                "x2": str(x),
                "y2": str(py + plan_h),
                "class": "grid",
            },
        )
    for j in range(GRID_DIV + 1):
        y = py + (j / GRID_DIV) * plan_h
        ET.SubElement(
            g_plan,
            "line",
            {
                "x1": str(px),
                "y1": str(y),
                "x2": str(px + plan_w),
                "y2": str(y),
                "class": "grid",
            },
        )

    y_dim = py + plan_h + 22
    ET.SubElement(
        g_plan,
        "line",
        {
            "x1": str(px),
            "y1": str(y_dim),
            "x2": str(px + plan_w),
            "y2": str(y_dim),
            "class": "dim",
        },
    )
    ET.SubElement(
        g_plan,
        "text",
        {
            "x": str(px + plan_w / 2),
            "y": str(y_dim + 14),
            "text-anchor": "middle",
            "class": "text dim-text",
        },
    ).text = f"{ROOM_W_FT:.0f}′"

    x_dim = px - 18
    ET.SubElement(
        g_plan,
        "line",
        {
            "x1": str(x_dim),
            "y1": str(py),
            "x2": str(x_dim),
            "y2": str(py + plan_h),
            "class": "dim",
        },
    )
    ET.SubElement(
        g_plan,
        "text",
        {
            "x": str(x_dim - 6),
            "y": str(py + plan_h / 2),
            "text-anchor": "middle",
            "class": "text dim-text",
            "transform": f"rotate(-90 {x_dim - 6} {py + plan_h / 2})",
        },
    ).text = f"{ROOM_D_FT:.0f}′"

    ET.SubElement(
        g_plan,
        "text",
        {"x": str(px), "y": str(py - 8), "class": "text meta"},
    ).text = "PLAN — GRID (SCHEMATIC)"

    ex = px + plan_w + gap
    ey = py + (plan_h - elev_h) / 2

    g_el = ET.SubElement(svg, "g", {"id": "elevation"})
    ET.SubElement(
        g_el,
        "rect",
        {"x": str(ex), "y": str(ey), "width": str(elev_w), "height": str(elev_h), "class": "elev"},
    )
    ET.SubElement(
        g_el,
        "line",
        {
            "x1": str(ex),
            "y1": str(ey),
            "x2": str(ex + elev_w),
            "y2": str(ey),
            "class": "ceiling",
        },
    )
    ET.SubElement(
        g_el,
        "text",
        {"x": str(ex), "y": str(ey - 8), "class": "text meta"},
    ).text = "ELEVATION — ONE BAY (SCHEMATIC)"

    xde = ex + elev_w + 14
    ET.SubElement(
        g_el,
        "line",
        {
            "x1": str(xde),
            "y1": str(ey),
            "x2": str(xde),
            "y2": str(ey + elev_h),
            "class": "dim",
        },
    )
    ET.SubElement(
        g_el,
        "text",
        {
            "x": str(xde + 8),
            "y": str(ey + elev_h / 2),
            "text-anchor": "middle",
            "class": "text dim-text",
            "transform": f"rotate(-90 {xde + 8} {ey + elev_h / 2})",
        },
    ).text = f"{CEILING_FT:.0f}′ CLEAR"

    g_tb = ET.SubElement(svg, "g", {"id": "title-block"})
    tx = m
    ty = h - title_h
    ET.SubElement(g_tb, "text", {"x": str(tx), "y": str(ty), "class": "text title"}).text = (
        "Light Art 023"
    )
    ET.SubElement(g_tb, "text", {"x": str(tx), "y": str(ty + 18), "class": "text meta"}).text = (
        f"{ARTIST}, {ART_YEAR}"
    )
    ET.SubElement(g_tb, "text", {"x": str(tx), "y": str(ty + 36), "class": "text meta"}).text = STUDIO
    ET.SubElement(g_tb, "text", {"x": str(tx), "y": str(ty + 54), "class": "text meta"}).text = (
        STUDIO_URL.replace("https://", "")
    )
    ET.SubElement(g_tb, "text", {"x": str(tx), "y": str(ty + 72), "class": "text meta"}).text = (
        MATERIALS
    )
    ET.SubElement(g_tb, "text", {"x": str(tx), "y": str(ty + 90), "class": "text nts"}).text = NTS_LINE
    ET.SubElement(g_tb, "text", {"x": str(tx), "y": str(ty + 108), "class": "text meta"}).text = (
        MOCKUP_NOTE
    )
    ET.SubElement(g_tb, "text", {"x": str(tx), "y": str(ty + 126), "class": "text meta"}).text = (
        f"ROOM: {ROOM_W_FT:.0f}′ × {ROOM_D_FT:.0f}′  ·  CEILING: {CEILING_FT:.0f}′  ·  "
        f"GRID: {GRID_DIV} × {GRID_DIV} CELLS (1′) — SCHEMATIC"
    )
    ET.SubElement(g_tb, "text", {"x": str(tx), "y": str(ty + 144), "class": "text meta"}).text = (
        "UNITS: FEET · ORTHOGONAL LUMINOUS VOLUME — NOT EVERY MEMBER SHOWN"
    )

    g_nts = ET.SubElement(svg, "g", {"id": "nts-callout"})
    ET.SubElement(
        g_nts,
        "text",
        {
            "x": f"{w - m * 0.35:.1f}",
            "y": f"{m * 0.45:.1f}",
            "text-anchor": "end",
            "class": "text nts",
        },
    ).text = NTS_LINE

    if THUMBNAILS:
        thumb_block_w = len(THUMBNAILS) * THUMB_W + max(0, len(THUMBNAILS) - 1) * THUMB_GAP
        x_right = w - m
        y_row = h - m - THUMB_H - 14
        g_th = ET.SubElement(svg, "g", {"id": "reference-thumbnails"})
        ET.SubElement(
            g_th,
            "text",
            {
                "x": f"{x_right:.1f}",
                "y": f"{y_row - 6:.1f}",
                "text-anchor": "end",
                "class": "text thumb-head",
            },
        ).text = "REFERENCE RENDERS (NOT TO SCALE)"
        for i, (filename, caption) in enumerate(THUMBNAILS):
            x0 = x_right - thumb_block_w + i * (THUMB_W + THUMB_GAP)
            ET.SubElement(
                g_th,
                "rect",
                {
                    "x": f"{x0:.1f}",
                    "y": f"{y_row:.1f}",
                    "width": str(THUMB_W),
                    "height": str(THUMB_H),
                    "fill": "#ffffff",
                    "stroke": "#bbbbbb",
                    "stroke-width": "0.75",
                },
            )
            ET.SubElement(
                g_th,
                "image",
                {
                    "href": filename,
                    "x": f"{x0:.1f}",
                    "y": f"{y_row:.1f}",
                    "width": str(THUMB_W),
                    "height": str(THUMB_H),
                    "preserveAspectRatio": "xMidYMid meet",
                },
            )
            cx_t = x0 + THUMB_W / 2
            cap_y = y_row + THUMB_H + 12
            ET.SubElement(
                g_th,
                "text",
                {
                    "x": f"{cx_t:.1f}",
                    "y": f"{cap_y:.1f}",
                    "text-anchor": "middle",
                    "class": "text thumb-cap",
                },
            ).text = caption

    return svg


def write_svg(path: Path, px_per_ft: float = 28.0) -> None:
    svg = build_svg(px_per_ft=px_per_ft)
    tree = ET.ElementTree(svg)
    ET.indent(tree, space="  ")
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        raise SystemExit(
            f"Cannot create output directory: {path.parent}\n{e}\n\n"
            "Use a writable path (not a placeholder like /path/to/...)."
        ) from e
    tree.write(
        path,
        encoding="utf-8",
        xml_declaration=True,
        default_namespace="",
    )


def main() -> None:
    p = argparse.ArgumentParser(description="Light Art 023 SVG technical drawing")
    p.add_argument("-o", "--output", type=Path, default=None)
    p.add_argument("--px-per-ft", type=float, default=28.0, help="Scale for schematic geometry")
    args = p.parse_args()
    out = args.output
    if out is None:
        out = Path(__file__).resolve().parent / "light_art_023_technical_drawing.svg"
    else:
        out = out.expanduser().resolve()
    write_svg(out, px_per_ft=args.px_per_ft)
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
