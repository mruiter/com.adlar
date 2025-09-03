import TuyAPI from 'tuyapi';

/**
 * Thin wrapper around TuyAPI with sane defaults + connect/disconnect helpers.
 */
export default class TuyaDeviceWrapper {
  constructor({ homey, deviceId, localKey, ip = null, log = () => {}, error = () => {} }) {
    this.homey = homey;
    this.deviceId = deviceId;
    this.localKey = localKey;
    this.ip = ip;
    this.log = log;
    this.error = error;

    if (!deviceId || !localKey) {
      throw new Error('Device ID en Local Key zijn vereist voor lokale Tuya-verbinding.');
    }

    this.device = new TuyAPI({
      id: this.deviceId,
      key: this.localKey,
      ip: this.ip || undefined,
      version: 3.3, // meeste moderne Tuya devices
      issueGetOnConnect: true
    });
  }

  async connect({ findIP = true, timeoutMs = 6000 } = {}) {
    if (findIP) {
      this.log('Zoek IP...');
      try {
        await this.device.find({ timeout: Math.floor(timeoutMs / 1000) });
        this.log('IP gevonden:', this.device.ip);
      } catch (e) {
        this.error('Kon IP niet vinden:', e?.message || e);
      }
    }

    this.log('Maak verbinding...');
    await this.device.connect();
    this.device.on('connected', () => this.log('TUYA connected'));
    this.device.on('disconnected', () => this.log('TUYA disconnected'));
    this.device.on('error', (err) => this.error('TUYA error', err?.message || err));

    // Probeer eerste status op te halen
    try {
      const status = await this.device.get({ schema: true });
      this.log('Eerste status ontvangen:', JSON.stringify(status));
    } catch (e) {
      this.error('Status ophalen faalde:', e?.message || e);
    }
  }

  async disconnect() {
    try {
      await this.device.disconnect();
    } catch (_) {}
  }
}