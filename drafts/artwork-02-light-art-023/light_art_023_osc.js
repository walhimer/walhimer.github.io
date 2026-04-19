/**
 * Light Art 023 — OSC export over WebSocket (browser cannot send UDP OSC directly).
 * Payload matches ../../studio/light-art-osc/OSC_MAP.md; relay: studio/light-art-osc/bridge/ws_to_osc.cjs
 */
const DEFAULT_WS = 'ws://127.0.0.1:9091';
const MIN_INTERVAL_MS = 80;

/**
 * @param {object} options
 * @param {() => object} options.getSnapshot — room/vis/modulation fields for OSC_MAP
 * @param {(status: string) => void} [options.onStatus]
 */
export function createOscExport(options) {
  let ws = null;
  let enabled = false;
  let url = DEFAULT_WS;
  let lastSend = 0;

  function buildPayload() {
    const s = options.getSnapshot();
    const vis = (v) => (v ? 1 : 0);
    const m = [
      ['/lightart/room/ft', 'f', s.roomFt],
      ['/lightart/ceiling/ft', 'f', s.ceilingFt],
      ['/lightart/grid/div', 'i', s.gridDiv],
      ['/lightart/diameter', 'f', s.diameter],
      ['/lightart/entropy', 'f', s.entropy],
      ['/lightart/tempo/bpm', 'f', s.tempo],
      ['/lightart/seed', 'i', s.seed],
      ['/lightart/vis/grid', 'f', vis(s.visGrid)],
      ['/lightart/vis/points', 'f', vis(s.visPoints)],
      ['/lightart/vis/boxes', 'f', vis(s.visBoxes)],
      ['/lightart/vis/curves', 'f', vis(s.visCurves)],
      ['/lightart/morph', 'f', s.morph],
      ['/lightart/pulse', 'f', s.pulse],
    ];
    return JSON.stringify({ v: 1, m });
  }

  function setStatus(st) {
    if (options.onStatus) options.onStatus(st);
  }

  function connect() {
    if (!enabled) return;
    try {
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        return;
      }
      ws = new WebSocket(url);
      setStatus('connecting');
      ws.onopen = () => setStatus('connected');
      ws.onclose = () => setStatus('disconnected');
      ws.onerror = () => setStatus('error');
    } catch (e) {
      setStatus('error');
    }
  }

  function disconnect() {
    if (ws) {
      ws.close();
      ws = null;
    }
    setStatus('disconnected');
  }

  function setEnabled(v) {
    enabled = v;
    if (v) {
      connect();
    } else {
      disconnect();
    }
  }

  function setWsUrl(u) {
    url = u || DEFAULT_WS;
    if (enabled) {
      disconnect();
      connect();
    }
  }

  /** Throttled send; call from animation loop when export is on. */
  function maybeSend() {
    if (!enabled || !ws || ws.readyState !== WebSocket.OPEN) return;
    const now = performance.now();
    if (now - lastSend < MIN_INTERVAL_MS) return;
    lastSend = now;
    ws.send(buildPayload());
  }

  /** Send one frame immediately (e.g. after parameter change). */
  function sendNow() {
    if (!enabled || !ws || ws.readyState !== WebSocket.OPEN) return;
    lastSend = performance.now();
    ws.send(buildPayload());
  }

  return {
    setEnabled,
    setWsUrl,
    connect,
    disconnect,
    maybeSend,
    sendNow,
  };
}
