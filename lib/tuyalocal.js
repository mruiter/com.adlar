'use strict';

const TuyAPI = require('tuyapi');

async function discoverDevices(timeout = 5000) {
  const tuya = new TuyAPI({ id: '', key: '' });
  try {
    const devices = await tuya.find({ timeout: Math.ceil(timeout / 1000), all: true });
    return devices.map(d => ({ id: d.id, ip: d.ip }));
  } catch (error) {
    return [];
  }
}

class TuyaLocalDevice {
  constructor({ id, key, ip }) {
    this.device = new TuyAPI({ id, key, ip });
  }

  async connect() {
    await this.device.find();
    await this.device.connect();
  }

  async disconnect() {
    try {
      await this.device.disconnect();
    } catch (error) {
      // ignore
    }
  }

  async set({ dps, set }) {
    return this.device.set({ dps, set });
  }

  async get({ dps }) {
    return this.device.get({ dps });
  }
}

module.exports = { discoverDevices, TuyaLocalDevice };
