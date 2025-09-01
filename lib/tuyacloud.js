'use strict';

const Cloud = require('@tuyapi/cloud');

/**
 * Fetch device IDs and local keys from Tuya Cloud.
 * Requires TUYA_API_KEY and TUYA_API_SECRET environment variables.
 * @param {Object} options
 * @param {string} options.username Tuya account email
 * @param {string} options.password Tuya account password
 * @param {string} [options.region='EU'] Tuya region code (e.g. EU, AZ, AY, IN)
 * @returns {Promise<Array<{id: string, key: string}>>}
 */
async function getCloudDeviceKeys({ username, password, region = 'EU' }) {
  const key = process.env.TUYA_API_KEY;
  const secret = process.env.TUYA_API_SECRET;

  if (!key || !secret) {
    throw new Error('Missing TUYA_API_KEY or TUYA_API_SECRET');
  }

  const api = new Cloud({ key, secret, region });

  await api.loginEx({ email: username, password });

  const groups = await api.request({ action: 'tuya.m.location.list' });
  let devices = [];
  for (const group of groups) {
    const list = await api.request({ action: 'tuya.m.my.group.device.list', gid: group.groupId });
    devices = devices.concat(list.map(d => ({ id: d.devId, key: d.localKey })));
  }
  return devices;
}

module.exports = { getCloudDeviceKeys };

