'use strict';

const TuyAPI = require('tuyapi');

async function discoverDevices(timeout = 5000) {
  console.log('[TuyaLocal] Starting device discovery');
  const tuya = new TuyAPI({});
  try {
    const devices = await tuya.find({ timeout: Math.ceil(timeout / 1000), all: true });
    console.log('[TuyaLocal] Discovery successful', devices);
    return devices.map(d => ({ id: d.id, ip: d.ip }));
  } catch (error) {
    console.error('[TuyaLocal] Discovery failed', error);
    return [];
  }
}

class TuyaLocalDevice {
  constructor({ id, key, ip }) {
    console.log('[TuyaLocal] Creating device', { id, ip });
    this.device = new TuyAPI({ id, key, ip });
  }

  async connect() {
    console.log('[TuyaLocal] Connecting');
    await this.device.find();
    await this.device.connect();
    console.log('[TuyaLocal] Connected');
  }

  async disconnect() {
    try {
      console.log('[TuyaLocal] Disconnecting');
      await this.device.disconnect();
    } catch (error) {
      console.error('[TuyaLocal] Disconnect error', error);
    }
  }

  async set({ dps, set }) {
    console.log('[TuyaLocal] Set', { dps, set });
    return this.device.set({ dps, set });
  }

  async get({ dps }) {
    console.log('[TuyaLocal] Get', { dps });
    const res = await this.device.get({ dps });
    console.log('[TuyaLocal] Got', { dps, res });
    return res;
  }
}

module.exports = { discoverDevices, TuyaLocalDevice };
