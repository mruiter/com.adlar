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
  console.log('[TuyaCloud] Fetching device keys', { username, region });
  const key = process.env.TUYA_API_KEY;
  const secret = process.env.TUYA_API_SECRET;

  if (!key || !secret) {
    throw new Error('Missing TUYA_API_KEY or TUYA_API_SECRET');
  }

  const api = new Cloud({ key, secret, region });

  console.log('[TuyaCloud] Logging in');
  await api.loginEx({ email: username, password });
  console.log('[TuyaCloud] Login successful');

  console.log('[TuyaCloud] Requesting location list');
  const groups = await api.request({ action: 'tuya.m.location.list' });
  console.log('[TuyaCloud] Location list response', groups);

  let devices = [];
  for (const group of groups) {
    console.log('[TuyaCloud] Requesting device list for group', group.groupId);
    const list = await api.request({ action: 'tuya.m.my.group.device.list', gid: group.groupId });
    console.log('[TuyaCloud] Device list for group', group.groupId, list);
    devices = devices.concat(list.map(d => ({ id: d.devId, key: d.localKey })));
  }
  console.log('[TuyaCloud] Retrieved device keys', devices);
  return devices;
}

module.exports = { getCloudDeviceKeys };

