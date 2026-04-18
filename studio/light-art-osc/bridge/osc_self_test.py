#!/usr/bin/env python3
"""
Light Art OSC — one terminal: listen, send test bundle, print lines, exit.

No second window. Same addresses as osc_send_test.py / OSC_MAP.md.

Usage:
  python3 bridge/osc_self_test.py
  python3 bridge/osc_self_test.py --host 127.0.0.1 --port 9000
"""

from __future__ import annotations

import argparse
import threading
import time

from pythonosc.dispatcher import Dispatcher
from pythonosc.osc_server import BlockingOSCUDPServer
from pythonosc.udp_client import SimpleUDPClient


def main() -> None:
    p = argparse.ArgumentParser(description="OSC round-trip self-test (single terminal)")
    p.add_argument("--host", default="127.0.0.1", help="Bind and send target")
    p.add_argument("--port", type=int, default=9000, help="UDP port")
    args = p.parse_args()

    lines: list[str] = []

    def handler(address: str, *osc_args: object) -> None:
        line = f"{address}\t{osc_args}"
        lines.append(line)
        print(line)

    dispatcher = Dispatcher()
    dispatcher.map("*", handler)
    try:
        server = BlockingOSCUDPServer((args.host, args.port), dispatcher)
    except OSError as e:
        raise SystemExit(
            f"Cannot bind {args.host}:{args.port} ({e}). "
            "Another process may be using this port (e.g. osc_listen.py). "
            "Stop it or use --port 9001."
        ) from e

    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    time.sleep(0.15)

    client = SimpleUDPClient(args.host, args.port)
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

    time.sleep(0.2)
    server.shutdown()
    thread.join(timeout=2.0)

    n = len(lines)
    print()
    if n == 13:
        print(f"OK — received {n} OSC messages (python-osc + UDP path works).")
    else:
        print(f"Unexpected: received {n} messages (expected 13). Check firewall or port conflict.")


if __name__ == "__main__":
    main()
