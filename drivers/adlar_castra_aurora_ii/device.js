import Homey from 'homey';
import TuyaDeviceWrapper from '../../lib/tuya-device-wrapper.js';

export default class AdlarDevice extends Homey.Device {
  async onInit() {
    this.log('Adlar device init');
    const store = this.getStore() || {};
    const settings = this.getSettings() || {};

    const deviceId = store.deviceId || settings.tuya_device_id;
    const localKey = store.localKey || settings.tuya_local_key;
    const ip = store.ip;

    this.tuya = new TuyaDeviceWrapper({
      homey: this.homey,
      deviceId,
      localKey,
      ip,
      log: (...args) => this.log('[TUYA]', ...args),
      error: (...args) => this.error('[TUYA]', ...args),
    });

    try {
      await this.tuya.connect();
      await this.setAvailable();
      this.log('Connected to Tuya device');
    } catch (e) {
      this.error('Failed to connect:', e?.message || e);
      await this.setUnavailable(`Geen verbinding: ${e?.message || e}`);
    }

    // Reconnect on setting changes
    this.on('settings', async (ev) => {
      if (ev.changedKeys.includes('tuya_device_id') || ev.changedKeys.includes('tuya_local_key')) {
        await this._reconnect();
      }
    });
  }

  async _reconnect() {
    try {
      await this.tuya?.disconnect?.();
      const settings = this.getSettings();
      this.tuya = new TuyaDeviceWrapper({
        homey: this.homey,
        deviceId: settings.tuya_device_id,
        localKey: settings.tuya_local_key,
        log: (...args) => this.log('[TUYA]', ...args),
        error: (...args) => this.error('[TUYA]', ...args),
      });
      await this.tuya.connect();
      await this.setAvailable();
    } catch (e) {
      this.error('Reconnect failed:', e);
      await this.setUnavailable(`Reconnect mislukte: ${e?.message || e}`);
    }
  }

  async onUninit() {
    await this.tuya?.disconnect?.();
  }
}