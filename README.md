# Adlar Warmtepomp (Tuya Local) — Homey SDK v3 + Homey Compose

**Status:** basis-skelet met pairing & instellingen. Waardes/capabilities worden in een volgende stap toegevoegd.

## Features (basis)
- SDK v3, JavaScript ESM (`"type": "module"`).
- Homey Compose voor drivers.
- Instellingenpagina met velden voor Tuya (Access ID/Key, Device ID, Local Key) en een **Test**-knop die een lokale verbindingscheck uitvoert.
- Pairing-wizard (list_devices) met *lokale discovery* poging en *handmatige invoer* fallback.
- `tuyapi` als LAN‑client.

> Afbeeldingen (iconen/large/small) zijn **niet** meegeleverd. In de JSON staat een referentie naar de standaardpaden onder `assets/` en `drivers/.../assets/`. Voeg je eigen bestanden toe voordat je de app valideert/installeert.

## Installatie
```bash
npm i
homey app validate
homey app run
```

## Instellingen
Open de app-instellingen in Homey en vul minimaal in:
- **Tuya Access ID** en **Tuya Access Key** (optioneel voor cloudreferentie; lokale modus gebruikt vooral Local Key).
- **Default Device ID** (bijv. `bfc9c6d6ded27c80a3im4n`).
- **Default Local Key** (per apparaat uit Tuya IoT Platform).
Klik **Test lokale verbinding** om te controleren of een apparaat op LAN bereikbaar is.

## Pairing
Gebruik **Voeg apparaat toe → Adlar Castra Aurora II**. De wizard probeert lokale discovery (op basis van `tuyapi`) uit te voeren. Lukt dat niet, kies **Handmatig** en voer Device ID en Local Key in. De app slaat deze op in de device store.

## Volgende stappen
- Capabilities en datapoints (DPS) in kaart brengen en toevoegen.
- Mapping van Tuya DPS ↔ Homey capabilities.
- Periodieke polling / push updates.