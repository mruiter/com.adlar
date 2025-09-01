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
      const tempIn = await this.tuya.get({ dps: 3 });
      this.setCapabilityValue('measure_temperature', Number(tempIn));
      const tempOut = await this.tuya.get({ dps: 4 });
      this.setCapabilityValue('measure_water_temperature_out', Number(tempOut));
      const ambient = await this.tuya.get({ dps: 6 });
      this.setCapabilityValue('measure_ambient_temperature', Number(ambient));
      const flow = await this.tuya.get({ dps: 26 });
      this.setCapabilityValue('measure_water_flow', Number(flow));
      const current = await this.tuya.get({ dps: 102 });
      this.setCapabilityValue('measure_current', Number(current) * 0.001);
      const voltage = await this.tuya.get({ dps: 103 });
      this.setCapabilityValue('measure_voltage', Number(voltage));
      const power = await this.tuya.get({ dps: 104 });
      this.setCapabilityValue('measure_power', Number(power) * 0.1);
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
