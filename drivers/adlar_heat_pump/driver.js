'use strict';

const { Driver } = require('homey');
const { discoverDevices } = require('../../lib/tuyalocal');
const { getCloudDeviceKeys } = require('../../lib/tuyacloud');

class AdlarHeatPumpDriver extends Driver {
  async onInit() {
    this.log('Adlar Heat Pump driver has been initialized');
  }

  async _discoverAndMerge() {
    const found = await discoverDevices();
    let cloud = [];
    const username = process.env.TUYA_USERNAME;
    const password = process.env.TUYA_PASSWORD;
    const region = process.env.TUYA_REGION || 'EU';

    if (username && password) {
      try {
        cloud = await getCloudDeviceKeys({ username, password, region });
      } catch (error) {
        this.log('Tuya cloud lookup failed', error);
      }
    }

    return found.map(dev => {
      const info = cloud.find(c => c.id === dev.id) || {};
      return {
        name: `Adlar Heat Pump ${dev.id}`,
        data: { id: dev.id },
        settings: { ip: dev.ip, key: info.key || '' }
      };
    });
  }

  async onPairListDevices() {
    return this._discoverAndMerge();
  }

  async onPair(session) {
    session.setHandler('discover', async () => {
      return this._discoverAndMerge();
    });
  }
}

module.exports = AdlarHeatPumpDriver;
