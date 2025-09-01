'use strict';

const { Driver } = require('homey');
const { discoverDevices } = require('../../lib/tuyalocal');

class AdlarHeatPumpDriver extends Driver {
  async onInit() {
    this.log('Adlar Heat Pump driver has been initialized');
  }

  async onPairListDevices() {
    const found = await discoverDevices();
    return found.map(dev => ({
      name: `Adlar Heat Pump ${dev.id}`,
      data: { id: dev.id },
      settings: { ip: dev.ip, key: '' }
    }));
  }
}

module.exports = AdlarHeatPumpDriver;
