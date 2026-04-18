#!/usr/bin/env python3
"""
Light Art OSC — minimal OSC listener (development).

Logs every message to stdout. Use with osc_send_test.py to verify UDP + python-osc.

Usage:
  python3 osc_listen.py
  python3 osc_listen.py --host 0.0.0.0 --port 9000
"""

from __future__ import annotations

import argparse

from pythonosc.dispatcher import Dispatcher
from pythonosc.osc_server import BlockingOSCUDPServer


def main() -> None:
    p = argparse.ArgumentParser(description="OSC listener for Light Art OSC")
    p.add_argument("--host", default="127.0.0.1", help="Bind address")
    p.add_argument("--port", type=int, default=9000, help="UDP port")
    args = p.parse_args()

    def handler(address: str, *osc_args: object) -> None:
        print(f"{address}\t{osc_args}")

    dispatcher = Dispatcher()
    dispatcher.map("*", handler)

    server = BlockingOSCUDPServer((args.host, args.port), dispatcher)
    print(f"Listening OSC udp://{args.host}:{args.port}  (Ctrl-C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
