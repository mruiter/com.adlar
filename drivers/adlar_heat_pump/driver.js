'use strict';

const { Driver } = require('homey');
const { discoverDevices } = require('../../lib/tuyalocal');
const { getCloudDeviceKeys } = require('../../lib/tuyacloud');

class AdlarHeatPumpDriver extends Driver {
  async onInit() {
    this.log('Adlar Heat Pump driver has been initialized');
  }

  async _discoverAndMerge() {
    this.log('Starting discovery of Adlar Heat Pumps');
    let found = [];
    try {
      found = await discoverDevices();
      this.log('Local discovery finished', found);
    } catch (error) {
      this.log('Local discovery failed', error);
    }

    let cloud = [];
    const username = process.env.TUYA_USERNAME;
    const password = process.env.TUYA_PASSWORD;
    const region = process.env.TUYA_REGION || 'EU';

    if (username && password) {
      this.log('Attempting Tuya cloud lookup');
      try {
        cloud = await getCloudDeviceKeys({ username, password, region });
        this.log('Tuya cloud lookup returned', cloud);
      } catch (error) {
        this.log('Tuya cloud lookup failed', error);
      }
    }

    const merged = found.map(dev => {
      const info = cloud.find(c => c.id === dev.id) || {};
      return {
        name: `Adlar Heat Pump ${dev.id}`,
        data: { id: dev.id },
        settings: { ip: dev.ip, key: info.key || '' }
      };
    });
    this.log('Discovery result', merged);
    return merged;
  }

  async onPairListDevices() {
    this.log('onPairListDevices called');
    return this._discoverAndMerge();
  }

  async onPair(session) {
    this.log('Pairing session started');
  }
}

module.exports = AdlarHeatPumpDriver;
