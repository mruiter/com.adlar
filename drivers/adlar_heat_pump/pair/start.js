Homey.on('init', () => {
  console.log('[Pair] init');
  const form = document.getElementById('login');
  const listEl = document.getElementById('devices');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    listEl.innerHTML = '';
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const region = document.getElementById('region').value;
    try {
      await Homey.emit('login', { username, password, region });
      console.log('[Pair] requesting device list');
      const devices = await Homey.emit('list_devices');
      console.log('[Pair] device list result', devices);
      if (devices.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No devices found';
        listEl.appendChild(li);
        return;
      }
      devices.forEach(device => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.textContent = device.name;
        btn.addEventListener('click', () => Homey.addDevice(device));
        li.appendChild(btn);
        listEl.appendChild(li);
      });
    } catch (err) {
      console.error('[Pair] discovery error', err);
      Homey.alert(err.message || err.toString());
    }
  });

  Homey.ready();
});
