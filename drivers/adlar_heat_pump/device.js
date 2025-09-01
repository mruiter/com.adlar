'use strict';

const { Device } = require('homey');
const { TuyaLocalDevice } = require('../../lib/tuyalocal');

class AdlarHeatPumpDevice extends Device {
  async onInit() {
    this.log('Adlar Heat Pump device initialized');
    const id = this.getData().id;
    const key = this.getSetting('key');
    const ip = this.getSetting('ip');
    this.tuya = new TuyaLocalDevice({ id, key, ip });
    try {
      await this.tuya.connect();
      this.setAvailable();
      this.pollInterval = setInterval(() => this.updateStatus(), 10000);
    } catch (error) {
      this.error(error);
      this.setUnavailable(error.message);
    }
  }

  async updateStatus() {
    try {
      const temp = await this.tuya.get({ dps: 3 });
      this.setCapabilityValue('measure_temperature', Number(temp));
      const target = await this.tuya.get({ dps: 2 });
      this.setCapabilityValue('target_temperature', Number(target));
    } catch (error) {
      this.error('Status update failed', error);
    }
  }

  async onCapabilityOnoff(value) {
    await this.tuya.set({ dps: 1, set: value });
  }

  async onCapabilityTarget_temperature(value) {
    await this.tuya.set({ dps: 2, set: value });
  }

  async onDeleted() {
    clearInterval(this.pollInterval);
    await this.tuya.disconnect();
  }
}

module.exports = AdlarHeatPumpDevice;
