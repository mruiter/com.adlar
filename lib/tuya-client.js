import dgram from 'dgram';

export default class TuyaClient {
  constructor({ app }) {
    this.app = app;
  }

  /**
   * Try to connect locally to a known device using its Device ID & Local Key.
   * Uses the TuyaDeviceWrapper (tuyapi under the hood).
   */
  async testLocalConnection({ deviceId, localKey }) {
    const { default: TuyaDeviceWrapper } = await import('./tuya-device-wrapper.js');
    const tdw = new TuyaDeviceWrapper({
      homey: this.app.homey,
      deviceId,
      localKey,
      log: (...a) => this.app.log('[TEST]', ...a),
      error: (...a) => this.app.error('[TEST]', ...a),
    });

    try {
      await tdw.connect({ findIP: true, timeoutMs: 5000 });
      await tdw.disconnect();
      return { ok: true, detail: 'LAN reachable' };
    } catch (e) {
      return { ok: false, detail: e?.message || String(e) };
    }
  }

  /**
   * Lightweight LAN discovery. We attempt two strategies:
   * 1) Listen for UDP broadcasts on ports 6666/6667 for a short time.
   * 2) (Optional) Future: use tuyapi.find() if available for active scanning.
   */
  async findNearbyDevices({ timeoutMs = 5000 } = {}) {
    const devices = new Map();

    const parseAndAdd = (buf) => {
      try {
        const s = buf.toString();
        // Tuya broadcast frames often contain JSON-like substrings with gwId and productKey
        const gwMatch = s.match(/"gwId"\s*:\s*"([^"]+)"/);
        const pkMatch = s.match(/"productKey"\s*:\s*"([^"]+)"/);
        if (gwMatch) {
          const gwId = gwMatch[1];
          const productKey = pkMatch ? pkMatch[1] : null;
          if (!devices.has(gwId)) devices.set(gwId, { gwId, productKey });
        }
      } catch (_) {}
    };

    const sockets = [6666, 6667].map(port => dgram.createSocket('udp4'));
    await Promise.all(sockets.map(sock => new Promise((resolve) => {
      sock.on('message', (msg) => parseAndAdd(msg));
      // Bind on random port and try to connect to avoid permission issues
      sock.bind(0, () => {
        try { sock.addMembership('224.0.0.0'); } catch (_) {}
        resolve();
      });
    })));

    await new Promise(res => setTimeout(res, timeoutMs));

    sockets.forEach(s => { try { s.close(); } catch (_) {} });

    // Convert to array
    return Array.from(devices.values());
  }
}