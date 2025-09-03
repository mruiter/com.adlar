
import Homey from 'homey';
import TuyaClient from './lib/tuya-client.js';

class AdlarApp extends Homey.App {
  async onInit() {
    this.log('Adlar Warmtepomp app gestart');
    this.tuya = new TuyaClient({ app: this });
    this._wireSettingsTest();
    this._wireSettingsDiscover();
  }

  _wireSettingsTest() {
    const settings = this.homey.settings;
    let running = false;

    settings.on('set', async (key) => {
      if (key !== 'tuya_test_now') return;
      if (running) return; // prevent re-entry

      const current = settings.get('tuya_test_now');
      if (current !== true) return; // only trigger when explicitly set to true

      running = true;
      const logLines = [];
      const log = (msg) => {
        logLines.push(msg);
        this.log(msg);
      };
      const accId = settings.get('tuya_access_id');
      const accKey = settings.get('tuya_access_key');
      const defaultDeviceId = settings.get('tuya_device_id');
      const defaultLocalKey = settings.get('tuya_local_key');
      const defaultIp = settings.get('tuya_local_ip');

      const start = new Date();
      log(`[${start.toISOString()}] Test gestart`);
      log(`Access ID present: ${Boolean(accId)} | Device ID: ${defaultDeviceId || '(leeg)'} | IP: ${defaultIp || '(leeg)'}`);

      try {
        if (defaultDeviceId && defaultLocalKey) {
          log('Probeer lokale Tuya-verbinding (LAN)...');
          const res = await this.tuya.testLocalConnection({ deviceId: defaultDeviceId, localKey: defaultLocalKey, ip: defaultIp });
          log(`LAN test: ${res.ok ? 'SUCCES' : 'MISLUKT'}${res.detail ? ' — ' + res.detail : ''}`);
        } else {
          log('Geen Device ID / Local Key ingevuld — sla lokale test over.');
        }
      } catch (e) {
        log(`Fout bij lokale test: ${e?.message || e}`);
      }

      const end = new Date();
      log(`[${end.toISOString()}] Test klaar (duur ${(end - start)} ms)`);
      try { settings.set('tuya_last_test_log', logLines.join('\n')); } catch (_) {}
      try { settings.set('tuya_test_now', false); } catch (_) {}

      running = false;
    });
  }

  _wireSettingsDiscover() {
    const settings = this.homey.settings;
    let running = false;

    settings.on('set', async (key) => {
      if (key !== 'tuya_find_now') return;
      if (running) return;

      const current = settings.get('tuya_find_now');
      if (current !== true) return;

      running = true;
      const logLines = [];
      const log = (msg) => {
        logLines.push(msg);
        this.log(msg);
      };

      const start = new Date();
      log(`[${start.toISOString()}] Zoeken gestart`);

      try {
        const found = await this.tuya.findNearbyDevices({ timeoutMs: 5000 });
        if (found.length) {
          log(`Gevonden ${found.length} apparaat(en):`);
          for (const d of found) {
            log(`- ${d.gwId}${d.productKey ? ' (' + d.productKey + ')' : ''}`);
          }
        } else {
          log('Geen apparaten gevonden.');
        }
      } catch (e) {
        log(`Fout bij zoeken: ${e?.message || e}`);
      }

      const end = new Date();
      log(`[${end.toISOString()}] Zoeken klaar (duur ${(end - start)} ms)`);
      try { settings.set('tuya_last_discover_log', logLines.join('\n')); } catch (_) {}
      try { settings.set('tuya_find_now', false); } catch (_) {}

      running = false;
    });
  }

  async discoverDevices() {
    const discovered = await this.tuya.findNearbyDevices({ timeoutMs: 5000 }).catch(() => []);
    return discovered.map(d => ({
      name: d.name || `Tuya Device ${d.gwId}`,
      data: { id: d.gwId },
      store: {
        deviceId: d.gwId,
        localKey: d.localKey || null,
        ip: d.ip || null,
        productKey: d.productKey || null
      },
      settings: {
        tuya_device_id: d.gwId,
        tuya_local_key: d.localKey || ''
      }
    }));
  }
}

export default AdlarApp;
