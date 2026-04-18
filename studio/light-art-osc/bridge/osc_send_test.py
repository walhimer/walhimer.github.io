#!/usr/bin/env python3
"""
Light Art OSC — send a test bundle matching OSC_MAP.md (draft v0.1).

Usage:
  python3 osc_send_test.py
  python3 osc_send_test.py --host 127.0.0.1 --port 9000
"""

from __future__ import annotations

import argparse

from pythonosc.udp_client import SimpleUDPClient


def main() -> None:
    p = argparse.ArgumentParser(description="Send test OSC messages for Light Art OSC")
    p.add_argument("--host", default="127.0.0.1", help="Target host")
    p.add_argument("--port", type=int, default=9000, help="Target UDP port")
    args = p.parse_args()

    client = SimpleUDPClient(args.host, args.port)

    # Align with light-art-023 defaults and OSC_MAP.md
    client.send_message("/lightart/room/ft", float(24))
    client.send_message("/lightart/ceiling/ft", float(12))
    client.send_message("/lightart/grid/div", int(18))
    client.send_message("/lightart/diameter", float(1.2))
    client.send_message("/lightart/entropy", float(0.56))
    client.send_message("/lightart/tempo/bpm", float(68))
    client.send_message("/lightart/seed", int(20260416))
    client.send_message("/lightart/vis/grid", float(1))
    client.send_message("/lightart/vis/points", float(1))
    client.send_message("/lightart/vis/boxes", float(1))
    client.send_message("/lightart/vis/curves", float(1))
    client.send_message("/lightart/morph", float(0.5))
    client.send_message("/lightart/pulse", float(0.5))

    print(f"Sent test bundle to udp://{args.host}:{args.port}")


if __name__ == "__main__":
    main()
