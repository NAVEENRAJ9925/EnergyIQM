# EnergyIQ API

Node.js + Express + MongoDB + JWT backend for the EnergyIQ smart energy hub.

## Setup

1. **Install dependencies** (already done): `npm install`

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env and set MONGO_URI and JWT_SECRET
   ```

3. **Start MongoDB** (local or use MongoDB Atlas):
   - Local: `mongod` or use Docker
   - Atlas: set `MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/energyiq`

4. **Run the server**:
   ```bash
   npm start
   ```
   API runs at `http://localhost:5000`

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user (returns JWT) |
| POST | /api/auth/login | Login (returns JWT) |
| GET | /api/energy/realtime | Latest energy reading (auth) |
| GET | /api/energy/history?range=daily\|weekly\|monthly | Aggregated history (auth) |
| GET | /api/energy/history-raw?limit=100 | Raw readings for charts (auth) |
| GET | /api/energy/bill?units=380 | Tamil Nadu bill prediction (auth) |
| POST | /api/energy/reading | ESP8266 pushes reading (no auth) |
| GET | /api/device | List devices (auth) |
| POST | /api/device/control | Toggle device ON/OFF (auth) |
| GET | /api/alerts | Get consumption alerts (auth) |

## ESP8266 Payload

```json
POST /api/energy/reading
{ "voltage": 230.5, "current": 4.2, "power": 968, "energy": 0.35, "frequency": 50.1 }
```

## Auth

Include JWT in requests: `Authorization: Bearer <token>`

## Email (Alerts)

To send alert notifications via email, set in `.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=EnergyIQ <your-email@gmail.com>
```

For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833).
