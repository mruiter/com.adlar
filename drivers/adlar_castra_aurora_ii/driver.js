import Homey from 'homey';

export default class AdlarDriver extends Homey.Driver {
  async onInit() {
    this.homey.app.log('Driver init: Adlar Castra Aurora II');
  }

  async onPairListDevices() {
    // Ask the app to provide discovered devices
    try {
      const list = await this.homey.app.discoverDevices();
      if (Array.isArray(list) && list.length) return list;
    } catch (e) {
      this.error('Discovery error', e);
    }
    // Fallback: manual
    return [{
      name: 'Handmatige invoer (voer Device ID & Local Key in na toevoegen)',
      data: { id: `manual-${Date.now()}` },
      store: { manual: true }
    }];
  }
}