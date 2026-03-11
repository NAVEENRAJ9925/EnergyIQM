/*
 * EnergyIQ ESP8266 - PZEM-004T + Relay
 * Pushes readings to EnergyIQ backend | Local web dashboard
 */
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <SoftwareSerial.h>
#include <PZEM004Tv30.h>

// ---- WiFi ----
const char* ssid = "Hello";
const char* password = "12345678";

// ---- Backend (EnergyIQ Node.js API) ----
const char* BACKEND_URL = "http://10.147.88.72:5000";  // Change to your backend IP/host
const char* USER_ID = "PUT_MONGO_USER_ID_HERE";        // Replace with user _id from MongoDB
#define PUSH_INTERVAL_MS 5000  // Push to backend every 5 seconds

// ---- PZEM ----
#define PZEM_RX 14  // D5 -> PZEM TX
#define PZEM_TX 13  // D6 -> PZEM RX
SoftwareSerial pzemSW(PZEM_RX, PZEM_TX);
PZEM004Tv30 pzem(pzemSW);

// ---- Relay ----
#define RELAY_PIN 5  // D1
bool relayState = false;

// ---- Web Server ----
ESP8266WebServer server(80);
unsigned long lastPush = 0;
bool lastPushOk = true;

// ---- Push readings to EnergyIQ backend ----
void pushToBackend(float voltage, float current, float power, float energy, float frequency) {
  if (WiFi.status() != WL_CONNECTED) return;
  
  WiFiClient client;
  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/energy/reading";
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");

  String body = "{\"voltage\":";
  body += String(round(voltage * 10) / 10.0, 1);
  body += ",\"current\":";
  body += String(round(current * 100) / 100.0, 2);
  body += ",\"power\":";
  body += String(round(power * 10) / 10.0, 1);
  body += ",\"energy\":";
  body += String(round(energy * 1000) / 1000.0, 3);
  body += ",\"frequency\":";
  body += String(round(frequency * 10) / 10.0, 1);
  body += ",\"userId\":\"";
  body += USER_ID;
  body += "\"}";

  int code = http.POST(body);
  lastPushOk = (code >= 200 && code < 300);
  http.end();

  if (!lastPushOk) {
    Serial.printf("Backend push failed: %d\n", code);
  }
}

// ---- Local JSON readings ----
void handleReadings() {
  float voltage = pzem.voltage();
  float current = pzem.current();
  float power = pzem.power();
  float energy = pzem.energy();
  float frequency = pzem.frequency();
  float pf = pzem.pf();

  bool ok = !(isnan(voltage) || isnan(current) || isnan(power));

  String json = "{";
  json += "\"ok\":" + String(ok ? "true" : "false") + ",";
  json += "\"voltage\":" + String(voltage, 1) + ",";
  json += "\"current\":" + String(current, 2) + ",";
  json += "\"power\":" + String(power, 1) + ",";
  json += "\"energy\":" + String(energy, 3) + ",";
  json += "\"frequency\":" + String(frequency, 1) + ",";
  json += "\"pf\":" + String(pf, 2) + ",";
  json += "\"relay\":" + String(relayState ? "true" : "false") + ",";
  json += "\"backend\":" + String(lastPushOk ? "true" : "false");
  json += "}";

  server.send(200, "application/json", json);
}

// ---- Dashboard HTML ----
String getDashboardHTML() {
  String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Smart Energy Monitor</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #1f2937, #0f172a);
  color: #e5e7eb;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 20px;
  margin: 0;
}
.container {
  width: 100%;
  max-width: 850px;
  text-align: center;
}
h1 {
  font-size: 2.3rem;
  font-weight: 800;
  color: #4ade80;
  text-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
}
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
  margin-top: 30px;
}
.card {
  background: #1e293b;
  border-radius: 12px;
  padding: 20px;
  border-left: 5px solid #4ade80;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s;
}
.card:hover { transform: translateY(-4px); }
.label { font-size: 0.9rem; color: #9ca3af; }
.value { font-size: 1.7rem; font-weight: 600; color: #f3f4f6; }
.unit { font-size: 1rem; color: #4ade80; margin-left: 4px; }
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  margin-top: 10px;
}
.badge-ok { background: #166534; color: #4ade80; }
.badge-fail { background: #991b1b; color: #f87171; }
.alert {
  background: #f87171;
  color: #1f2937;
  padding: 10px;
  border-radius: 8px;
  margin: 15px 0;
  font-weight: 600;
  display: none;
}
button {
  padding: 10px 25px;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
  transition: background 0.3s;
}
.on { background-color: #4ade80; color: #0f172a; }
.off { background-color: #f87171; color: #0f172a; }
button:hover { opacity: 0.9; }
.footer { font-size: 0.8rem; color: #9ca3af; margin-top: 30px; }
@media (max-width:600px){ h1{font-size:1.8rem;} .value{font-size:1.4rem;} }
</style>
</head>
<body>
<div class="container">
  <h1>Smart Energy Monitor</h1>
  <p>Live readings from PZEM-004T • Synced to EnergyIQ</p>
  <div id="pzem-alert" class="alert">⚠ No response from PZEM module!</div>
  <div id="backend-badge" class="badge badge-ok">EnergyIQ: Syncing</div>
  <div class="grid-container">
    <div class="card"><div class="label">Voltage</div><div class="value"><span id="voltage">--</span><span class="unit">V</span></div></div>
    <div class="card"><div class="label">Current</div><div class="value"><span id="current">--</span><span class="unit">A</span></div></div>
    <div class="card"><div class="label">Power</div><div class="value"><span id="power">--</span><span class="unit">W</span></div></div>
    <div class="card"><div class="label">Energy</div><div class="value"><span id="energy">--</span><span class="unit">kWh</span></div></div>
    <div class="card"><div class="label">Frequency</div><div class="value"><span id="frequency">--</span><span class="unit">Hz</span></div></div>
    <div class="card"><div class="label">Power Factor</div><div class="value"><span id="pf">--</span></div></div>
  </div>

  <div style="margin-top:35px;">
    <button id="relay-btn" class="on" onclick="toggleRelay()">Turn ON</button>
    <p>Relay Status: <b id="relay-status">OFF</b></p>
  </div>

  <div class="footer">
    ESP8266 IP: <span id="ip">%IP%</span> | Local refresh: 2s | Backend push: 5s
  </div>
</div>

<script>
function updateReadings() {
  fetch('/readings')
    .then(res => res.json())
    .then(data => {
      const alertBox = document.getElementById('pzem-alert');
      if (data.ok) {
        alertBox.style.display = 'none';
        document.getElementById('voltage').textContent = data.voltage.toFixed(1);
        document.getElementById('current').textContent = data.current.toFixed(2);
        document.getElementById('power').textContent = data.power.toFixed(1);
        document.getElementById('energy').textContent = data.energy.toFixed(3);
        document.getElementById('frequency').textContent = data.frequency.toFixed(1);
        document.getElementById('pf').textContent = data.pf.toFixed(2);
        document.getElementById('relay-status').textContent = data.relay ? "ON" : "OFF";
        const btn = document.getElementById('relay-btn');
        btn.textContent = data.relay ? "Turn OFF" : "Turn ON";
        btn.className = data.relay ? "off" : "on";
        const badge = document.getElementById('backend-badge');
        badge.textContent = data.backend ? "EnergyIQ: Syncing" : "EnergyIQ: Failed";
        badge.className = data.backend ? "badge badge-ok" : "badge badge-fail";
      } else {
        alertBox.style.display = 'block';
      }
    })
    .catch(() => { document.getElementById('pzem-alert').style.display = 'block'; });
}
function toggleRelay() {
  fetch('/toggleRelay').then(() => updateReadings());
}
updateReadings();
setInterval(updateReadings, 2000);
</script>
</body>
</html>
)rawliteral";

  html.replace("%IP%", WiFi.localIP().toString());
  return html;
}

void handleRoot() {
  server.send(200, "text/html", getDashboardHTML());
}

void handleToggleRelay() {
  relayState = !relayState;
  digitalWrite(RELAY_PIN, relayState ? LOW : HIGH);
  server.send(200, "text/plain", "OK");
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());

  server.on("/", handleRoot);
  server.on("/readings", handleReadings);
  server.on("/toggleRelay", handleToggleRelay);
  server.begin();
  Serial.println("Web Server started");
  Serial.println("Backend: " + String(BACKEND_URL));
}

void loop() {
  server.handleClient();

  // Push to EnergyIQ backend every 5 seconds
  if (millis() - lastPush >= PUSH_INTERVAL_MS) {
    lastPush = millis();
    float v = pzem.voltage();
    float i = pzem.current();
    float p = pzem.power();
    float e = pzem.energy();
    float f = pzem.frequency();
    if (!(isnan(v) || isnan(i) || isnan(p))) {
      pushToBackend(v, i, p, e, f);
    }
  }
}