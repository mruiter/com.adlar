'use strict';

const { Driver } = require('homey');
const { discoverDevices } = require('../../lib/tuyalocal');
const { getCloudDeviceKeys } = require('../../lib/tuyacloud');

class AdlarHeatPumpDriver extends Driver {
  async onInit() {
    this.log('Adlar Heat Pump driver has been initialized');
  }

  async _discoverAndMerge(creds = {}) {
    const username = creds.username || process.env.TUYA_USERNAME;
    const password = creds.password || process.env.TUYA_PASSWORD;
    const region = creds.region || process.env.TUYA_REGION || 'EU';
    this.log('Starting discovery of Adlar Heat Pumps', { hasUsername: !!username, region });

    let found = [];
    try {
      found = await discoverDevices();
      this.log('Local discovery finished', { count: found.length, devices: found });
    } catch (error) {
      this.error('Local discovery failed', error);
    }

    let cloud = [];

    if (username && password) {
      this.log('Attempting Tuya cloud lookup', { username, region });
      try {
        cloud = await getCloudDeviceKeys({ username, password, region });
        this.log('Tuya cloud lookup returned', { count: cloud.length, devices: cloud });
      } catch (error) {
        this.error('Tuya cloud lookup failed', error);
      }
    } else {
      this.log('No Tuya cloud credentials provided, skipping cloud lookup');
    }

    const merged = found.map(dev => {
      const info = cloud.find(c => c.id === dev.id) || {};
      return {
        name: `Adlar Heat Pump ${dev.id}`,
        data: { id: dev.id },
        settings: { ip: dev.ip, key: info.key || '' }
      };
    });

    const foundIds = new Set(found.map(dev => dev.id));
    cloud.forEach(info => {
      if (!foundIds.has(info.id)) {
        merged.push({
          name: `Adlar Heat Pump ${info.id}`,
          data: { id: info.id },
          settings: { ip: '', key: info.key || '' }
        });
      }
    });

    this.log('Discovery result', { count: merged.length, devices: merged });
    return merged;
  }

  async onPairListDevices() {
    this.log('onPairListDevices called');
    return this._discoverAndMerge();
  }

  async onPair(session) {
    this.log('Pairing session started');
    let creds = {};

    session.setHandler('login', async data => {
      this.log('Login handler invoked', { hasUsername: !!data.username, region: data.region });
      creds = data || {};
      return true;
    });

    session.setHandler('list_devices', async () => {
      this.log('List devices handler invoked');
      return this._discoverAndMerge(creds);
    });
  }
}

module.exports = AdlarHeatPumpDriver;
