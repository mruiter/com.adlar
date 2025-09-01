Adlar Heat Pump Homey App
=========================

This Homey SDK3 application adds support for the Adlar Heat Pump using the
tuya-local protocol. Devices are discovered on the local network and can be
controlled without cloud access.

Features:
- Automatic discovery of Tuya compatible Adlar Heat Pump devices on the LAN.
- Control of on/off state and target temperature.
- Periodic polling of current temperature.
- Optional retrieval of local device keys from Tuya Cloud when
  `TUYA_USERNAME`, `TUYA_PASSWORD`, `TUYA_API_KEY` and `TUYA_API_SECRET`
  environment variables are provided.

Installation:
1. Install the app on your Homey.
2. Start pairing and select the discovered Adlar Heat Pump device.
3. Provide the device key when prompted to enable secure local control. If
   environment variables for Tuya Cloud login are set, the key will be filled
   automatically when pairing.

Notes:
- Device key is required for full control and must be obtained from the Tuya
  platform or manufacturer.
- DPS mappings used are typical for Tuya heat pumps (1=on/off, 2=target
  temperature, 3=current temperature) but may need adjustment for specific
  models.
- Icon and image assets are referenced but not included; supply your own
  `assets/icon.svg` and driver images before packaging the app.

This app uses the tuyapi library as a base for tuya-local communication.
