/**
 * Light Art OSC — Node.js one-shot: bind, send test bundle (osc.js), print, exit.
 *
 * Same addresses as osc_self_test.py / OSC_MAP.md.
 *
 * Usage (from light-art-osc, after npm install in bridge/):
 *   node bridge/osc_self_test.cjs
 *   node bridge/osc_self_test.cjs --host 127.0.0.1 --port 9000
 */

"use strict";

const osc = require("osc");

function parseArgs() {
  const out = { host: "127.0.0.1", port: 9000 };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] === "--host") {
      out.host = a[i + 1] || out.host;
      i += 1;
    } else if (a[i] === "--port") {
      out.port = parseInt(a[i + 1], 10) || out.port;
      i += 1;
    }
  }
  return out;
}

/** @type {Array<{ address: string, args: Array<{ type: string, value: number }> }>} */
function testMessages() {
  return [
    { address: "/lightart/room/ft", args: [{ type: "f", value: 24 }] },
    { address: "/lightart/ceiling/ft", args: [{ type: "f", value: 12 }] },
    { address: "/lightart/grid/div", args: [{ type: "i", value: 18 }] },
    { address: "/lightart/diameter", args: [{ type: "f", value: 1.2 }] },
    { address: "/lightart/entropy", args: [{ type: "f", value: 0.56 }] },
    { address: "/lightart/tempo/bpm", args: [{ type: "f", value: 68 }] },
    { address: "/lightart/seed", args: [{ type: "i", value: 20260416 }] },
    { address: "/lightart/vis/grid", args: [{ type: "f", value: 1 }] },
    { address: "/lightart/vis/points", args: [{ type: "f", value: 1 }] },
    { address: "/lightart/vis/boxes", args: [{ type: "f", value: 1 }] },
    { address: "/lightart/vis/curves", args: [{ type: "f", value: 1 }] },
    { address: "/lightart/morph", args: [{ type: "f", value: 0.5 }] },
    { address: "/lightart/pulse", args: [{ type: "f", value: 0.5 }] },
  ];
}

function main() {
  const { host, port } = parseArgs();

  const receivePort = new osc.UDPPort({
    localAddress: host,
    localPort: port,
    metadata: true,
  });

  // Ephemeral local port avoids clashing with anything bound to 9001.
  const sendPort = new osc.UDPPort({
    localAddress: host,
    localPort: 0,
    remoteAddress: host,
    remotePort: port,
    metadata: true,
  });

  const lines = [];

  receivePort.on("message", (oscMsg) => {
    const row = `${oscMsg.address}\t${JSON.stringify(oscMsg.args)}`;
    lines.push(row);
    console.log(row);
  });

  receivePort.on("error", (err) => {
    const msg = err && err.message ? err.message : String(err);
    console.error(msg);
    if (/EADDRINUSE|in use/i.test(msg)) {
      console.error(
        `Cannot bind ${host}:${port}. Stop osc_listen.py / Python self-test or use --port 9002.`
      );
    }
    process.exit(1);
  });

  sendPort.on("error", (err) => {
    const msg = err && err.message ? err.message : String(err);
    console.error(msg);
    process.exit(1);
  });

  let readyCount = 0;
  function onReady() {
    readyCount += 1;
    if (readyCount < 2) {
      return;
    }
    const messages = testMessages();
    messages.forEach((m) => {
      sendPort.send(m, host, port);
    });
    setTimeout(() => {
      receivePort.close();
      sendPort.close();
      console.log("");
      const n = lines.length;
      if (n === 13) {
        console.log("OK — received 13 OSC messages (osc.js + UDP path works).");
        process.exit(0);
      } else {
        console.log(
          `Unexpected: received ${n} messages (expected 13). Check port conflict or firewall.`
        );
        process.exit(1);
      }
    }, 250);
  }

  try {
    receivePort.open();
    sendPort.open();
  } catch (e) {
    console.error(String(e));
    process.exit(1);
  }

  receivePort.on("ready", onReady);
  sendPort.on("ready", onReady);
}

main();
