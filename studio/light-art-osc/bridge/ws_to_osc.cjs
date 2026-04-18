#!/usr/bin/env node
/**
 * WebSocket → UDP OSC relay for Light Art 023 (browser cannot send UDP).
 *
 * Listens: ws://127.0.0.1:9091 (configurable via env)
 * Forwards: OSC UDP to 127.0.0.1:9000 (configurable via env)
 *
 * Message format (JSON text):
 *   { "v": 1, "m": [ ["/lightart/room/ft", "f", 24], ["/lightart/grid/div", "i", 18], ... ] }
 *
 * Usage:
 *   node ws_to_osc.cjs
 *   WS_PORT=9091 OSC_PORT=9000 node ws_to_osc.cjs
 */

'use strict';

const osc = require('osc');
const WebSocket = require('ws');

const WS_HOST = process.env.WS_HOST || '127.0.0.1';
const WS_PORT = parseInt(process.env.WS_PORT || '9091', 10);
const OSC_HOST = process.env.OSC_HOST || '127.0.0.1';
const OSC_PORT = parseInt(process.env.OSC_PORT || '9000', 10);

const sendPort = new osc.UDPPort({
  localAddress: OSC_HOST,
  localPort: 0,
  remoteAddress: OSC_HOST,
  remotePort: OSC_PORT,
  metadata: true,
});

sendPort.open();

sendPort.on('ready', () => {
  console.log(`OSC UDP → ${OSC_HOST}:${OSC_PORT} (ephemeral local bind)`);
});

sendPort.on('error', (err) => {
  console.error(err.message || err);
});

const wss = new WebSocket.Server({ host: WS_HOST, port: WS_PORT });

wss.on('listening', () => {
  console.log(`WebSocket relay ws://${WS_HOST}:${WS_PORT} → OSC ${OSC_HOST}:${OSC_PORT}`);
});

wss.on('connection', (socket) => {
  socket.on('message', (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }
    if (!msg || msg.v !== 1 || !Array.isArray(msg.m)) return;

    for (let i = 0; i < msg.m.length; i += 1) {
      const row = msg.m[i];
      if (!Array.isArray(row) || row.length < 3) continue;
      const address = row[0];
      const typ = row[1] === 'i' ? 'i' : 'f';
      const value = row[2];
      sendPort.send(
        {
          address,
          args: [{ type: typ, value }],
        },
        OSC_HOST,
        OSC_PORT
      );
    }
  });
});
