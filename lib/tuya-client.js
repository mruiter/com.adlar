import dgram from 'dgram';

export default class TuyaClient {
  constructor({ app }) {
    this.app = app;
  }

  /**
   * Try to connect locally to a known device using its Device ID & Local Key.
   * Uses the TuyaDeviceWrapper (tuyapi under the hood).
   */
  async testLocalConnection({ deviceId, localKey, ip = null }) {
    const { default: TuyaDeviceWrapper } = await import('./tuya-device-wrapper.js');
    const tdw = new TuyaDeviceWrapper({
      homey: this.app.homey,
      deviceId,
      localKey,
      ip: ip || undefined,
      log: (...a) => this.app.log('[TEST]', ...a),
      error: (...a) => this.app.error('[TEST]', ...a),
    });

    try {
      await tdw.connect({ findIP: !ip, timeoutMs: 5000 });
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
    const log = (...a) => this.app.log('[DISCOVER]', ...a);
    log(`Starting discovery for ${timeoutMs} ms`);

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
          if (!devices.has(gwId)) {
            devices.set(gwId, { gwId, productKey });
            log(`Discovered ${gwId}${productKey ? ' (' + productKey + ')' : ''}`);
          }
        } else {
          log('Received UDP packet without gwId');
        }
      } catch (e) {
        log(`Error parsing UDP packet: ${e?.message || e}`);
      }
    };

    const ports = [6666, 6667];
    const sockets = await Promise.all(ports.map(port => new Promise((resolve) => {
      const sock = dgram.createSocket('udp4');
      sock.on('message', (msg, rinfo) => {
        log(`UDP from ${rinfo.address}:${rinfo.port} -> ${port} (${msg.length} bytes)`);
        parseAndAdd(msg);
      });
      sock.bind(port, () => {
        log(`Listening on UDP port ${port}`);
        try { sock.addMembership('224.0.0.0'); } catch (_) {}
        resolve(sock);
      });
    })));

    await new Promise(res => setTimeout(res, timeoutMs));

    sockets.forEach(s => { try { s.close(); } catch (_) {} });

    log(`Discovery finished, found ${devices.size} device(s)`);

    // Convert to array
    return Array.from(devices.values());
  }
}
