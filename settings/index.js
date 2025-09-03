/* global Homey */
if (!window.Homey) { document.body.innerHTML = '<p style="font-family:system-ui">Homey SDK niet geladen. Ververs de pagina.</p>'; }
async function load() {
  const get = Homey.get;
  const set = Homey.set;

  // Populate fields
  for (const key of ['tuya_access_id', 'tuya_access_key', 'tuya_device_id', 'tuya_local_key', 'tuya_last_test_log']) {
    try {
      const val = await get(key);
      const el = document.getElementById(key);
      if (el && typeof val === 'string') el.value = val;
      if (key === 'tuya_last_test_log' && val) document.getElementById('log').textContent = val;
    } catch (e) {}
  }

  document.getElementById('btnSave').addEventListener('click', async () => {
    for (const key of ['tuya_access_id', 'tuya_access_key', 'tuya_device_id', 'tuya_local_key']) {
      const el = document.getElementById(key);
      await set(key, el.value || '');
    }
    Homey.alert('Opgeslagen!');
  });

  document.getElementById('btnTest').addEventListener('click', async () => {
    await set('tuya_test_request_at', Date.now());
    document.getElementById('log').textContent = 'Test gestart... even geduld';
    // Poll for log result
    const start = Date.now();
    const poll = setInterval(async () => {
      const log = await get('tuya_last_test_log');
      if (log && log.includes('Test klaar')) {
        clearInterval(poll);
        document.getElementById('log').textContent = log;
      } else if (Date.now() - start > 10000) {
        clearInterval(poll);
        document.getElementById('log').textContent = 'Time-out: geen resultaat binnen 10s.';
      }
    }, 800);
  });
}

document.addEventListener('DOMContentLoaded', load);

// Signal to Homey that the settings view is ready
try { Homey.ready(); } catch (_) {}
