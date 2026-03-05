# EnergyIQ ESP8266 Firmware

PZEM-004T energy monitor + relay control, synced to the EnergyIQ backend.

## Requirements

- **Arduino IDE** or **PlatformIO**
- **ESP8266** board support
- **Libraries** (install via Library Manager):
  - `PZEM004Tv30` (by Napat V.)

## Configuration

Edit in `EnergyIQ_ESP8266.ino`:

```cpp
const char* ssid = "YourWiFiSSID";
const char* password = "YourWiFiPassword";
const char* BACKEND_URL = "http://YOUR_BACKEND_IP:5000";  // Node.js API
```

## Behavior

| Feature        | Details                                                                 |
|----------------|-------------------------------------------------------------------------|
| Local dashboard| `http://<ESP8266_IP>/` — live PZEM readings, relay toggle               |
| Backend sync   | POST to `/api/energy/reading` every 5 seconds                           |
| Relay          | Controlled locally from the ESP8266 dashboard (D1 pin)                  |

## Backend

Make sure the EnergyIQ Node.js backend is running and reachable on the same network:

```bash
npm run api
# Backend on http://localhost:5000
```

If the backend runs on your PC, use the PC's LAN IP (e.g. `http://192.168.1.5:5000`).
