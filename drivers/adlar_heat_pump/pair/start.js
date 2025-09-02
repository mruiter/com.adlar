Homey.on('init', async () => {
  console.log('[Pair] init');
  const listEl = document.getElementById('devices');
  try {
    console.log('[Pair] requesting discovery');
    const devices = await Homey.emit('discover');
    console.log('[Pair] discovery result', devices);
    if (devices.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No devices found';
      listEl.appendChild(li);
      Homey.ready();
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
    Homey.ready();
  } catch (err) {
    console.error('[Pair] discovery error', err);
    Homey.alert(err.message || err.toString());
    Homey.ready();
  }
});
