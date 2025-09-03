/* global Homey */

async function load(Homey) {
  // Populate fields
  for (const key of ['tuya_access_id', 'tuya_access_key', 'tuya_device_id', 'tuya_local_key', 'tuya_last_test_log', 'tuya_last_discover_log']) {
    try {
      const val = await Homey.get(key);
      const el = document.getElementById(key);
      if (el && typeof val === 'string') el.value = val;
      if ((key === 'tuya_last_test_log' || key === 'tuya_last_discover_log') && val) {
        document.getElementById('log').textContent = val;
      }
    } catch (e) {
      // ignore
    }
  }

  document.getElementById('btnSave').addEventListener('click', async () => {
    for (const key of ['tuya_access_id', 'tuya_access_key', 'tuya_device_id', 'tuya_local_key']) {
      const el = document.getElementById(key);
      await Homey.set(key, el.value || '');
    }
    Homey.alert('Opgeslagen!');
  });

  document.getElementById('btnTest').addEventListener('click', async () => {
    document.getElementById('log').textContent = 'Test gestart... even geduld';
    await Homey.set('tuya_last_test_log', '');
    await Homey.set('tuya_test_now', true);
    // Poll for log result
    const start = Date.now();
    const poll = setInterval(async () => {
      const log = await Homey.get('tuya_last_test_log');
      if (log && log.includes('Test klaar')) {
        clearInterval(poll);
        document.getElementById('log').textContent = log;
      } else if (Date.now() - start > 10000) {
        clearInterval(poll);
        document.getElementById('log').textContent = 'Time-out: geen resultaat binnen 10s.';
      }
    }, 800);
  });

  document.getElementById('btnSearch').addEventListener('click', async () => {
    document.getElementById('log').textContent = 'Zoeken gestart... even geduld';
    await Homey.set('tuya_last_discover_log', '');
    await Homey.set('tuya_find_now', true);
    const start = Date.now();
    const poll = setInterval(async () => {
      const log = await Homey.get('tuya_last_discover_log');
      if (log && log.includes('Zoeken klaar')) {
        clearInterval(poll);
        document.getElementById('log').textContent = log;
      } else if (Date.now() - start > 10000) {
        clearInterval(poll);
        document.getElementById('log').textContent = 'Time-out: geen resultaat binnen 10s.';
      }
    }, 800);
  });

  Homey.ready();
}

function onHomeyReady(Homey) {
  load(Homey).catch(() => {
    document.body.innerHTML = '<p style="font-family:system-ui">Homey SDK niet geladen. Ververs de pagina.</p>';
  });
}

