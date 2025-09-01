'use strict';

const { App } = require('homey');

class AdlarApp extends App {
  async onInit() {
    this.log('Adlar Heat Pump app initialized');
  }
}

module.exports = AdlarApp;
