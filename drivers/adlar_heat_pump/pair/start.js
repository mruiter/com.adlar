Homey.on('init', async () => {
  const listEl = document.getElementById('devices');
  try {
    const devices = await Homey.emit('discover');
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
    Homey.alert(err.message || err.toString());
  }
});
