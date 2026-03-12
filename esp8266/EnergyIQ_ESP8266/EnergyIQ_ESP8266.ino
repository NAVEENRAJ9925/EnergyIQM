/*
 * EnergyIQ ESP8266 - PZEM-004T + Relay
 * Local dashboard + EnergyIQ backend sync
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

// ---- Backend (EnergyIQ) ----
const char* BACKEND_URL = "http://10.147.88.72:5000";
const char* USER_ID = "69b2b821360e35793551b630";          // 24-char hex from MongoDB users._id
const char* DEVICE_API_KEY = "1d3359aee299cf2c308d946a4f845cbd5810480f4b7bbf0162c753837848611e";
#define RELAY_DEVICE_NAME "Light"
#define PUSH_INTERVAL_MS 5000
#define DEVICE_POLL_MS 5000
#define HTTP_TIMEOUT_MS 8000

// ---- PZEM ----
#define PZEM_RX 14
#define PZEM_TX 13
SoftwareSerial pzemSW(PZEM_RX, PZEM_TX);
PZEM004Tv30 pzem(pzemSW);

// ---- Relay ----
#define RELAY_PIN 5
bool relayState = false;

// ---- Web Server ----
ESP8266WebServer server(80);
unsigned long lastPush = 0;
unsigned long lastDevicePoll = 0;
bool lastPushOk = false;

// ---- Push energy readings to backend ----
void pushToBackend(float v, float i, float p, float e, float f) {
  WiFiClient client;
  HTTPClient http;
  http.begin(client, String(BACKEND_URL) + "/api/energy/reading");
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(HTTP_TIMEOUT_MS);

  String body = "{\"voltage\":" + String(v, 1) + ",\"current\":" + String(i, 2) +
    ",\"power\":" + String(p, 1) + ",\"energy\":" + String(e, 3) +
    ",\"frequency\":" + String(f, 1) + ",\"userId\":\"" + String(USER_ID) + "\"}";

  int code = http.POST(body);
  lastPushOk = (code >= 200 && code < 300);
  http.end();

  if (!lastPushOk) Serial.printf("Energy push %d\n", code);
}

// ---- Sync relay from web app ----
void syncRelayFromBackend() {
  if (strcmp(DEVICE_API_KEY, "PUT_DEVICE_API_KEY_HERE") == 0) return;

  WiFiClient client;
  HTTPClient http;
  http.begin(client, String(BACKEND_URL) + "/api/device");
  http.addHeader("Authorization", "Bearer " + String(DEVICE_API_KEY));
  http.setTimeout(HTTP_TIMEOUT_MS);

  int code = http.GET();
  String payload = code == 200 ? http.getString() : "";
  http.end();

  if (code != 200 || payload.length() == 0) return;

  String needle = "\"name\":\"" + String(RELAY_DEVICE_NAME) + "\",\"isOn\":";
  int idx = payload.indexOf(needle);
  if (idx < 0) return;
  bool targetOn = (payload.charAt(idx + needle.length()) == 't');

  if (relayState != targetOn) {
    relayState = targetOn;
    digitalWrite(RELAY_PIN, relayState ? LOW : HIGH);
    Serial.printf("Relay %s\n", relayState ? "ON" : "OFF");
  }
}

// ---- Push relay state to backend (on local toggle) ----
void pushRelayToBackend() {
  if (strcmp(DEVICE_API_KEY, "PUT_DEVICE_API_KEY_HERE") == 0) return;

  WiFiClient client;
  HTTPClient http;
  http.begin(client, String(BACKEND_URL) + "/api/device/control");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(DEVICE_API_KEY));
  http.setTimeout(HTTP_TIMEOUT_MS);
  http.POST("{\"device\":\"" + String(RELAY_DEVICE_NAME) + "\",\"state\":" + (relayState ? "true" : "false") + "}");
  http.end();
}

// ---- JSON readings ----
void handleReadings() {
  float v = pzem.voltage();
  float i = pzem.current();
  float p = pzem.power();
  float e = pzem.energy();
  float f = pzem.frequency();
  float pf = pzem.pf();
  bool ok = !(isnan(v) || isnan(i) || isnan(p));

  String json = "{\"ok\":" + String(ok ? "true" : "false") + ",\"voltage\":" + String(v, 1) +
    ",\"current\":" + String(i, 2) + ",\"power\":" + String(p, 1) + ",\"energy\":" + String(e, 3) +
    ",\"frequency\":" + String(f, 1) + ",\"pf\":" + String(pf, 2) +
    ",\"relay\":" + String(relayState ? "true" : "false") +
    ",\"backend\":" + String(lastPushOk ? "true" : "false") + "}";
  server.send(200, "application/json", json);
}

// ---- Dashboard ----
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
body{font-family:'Inter',sans-serif;background:linear-gradient(135deg,#1f2937,#0f172a);color:#e5e7eb;display:flex;justify-content:center;align-items:flex-start;min-height:100vh;padding:20px;margin:0;}
.container{width:100%;max-width:850px;text-align:center;}
h1{font-size:2.3rem;font-weight:800;color:#4ade80;}
.grid-container{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:20px;margin-top:30px;}
.card{background:#1e293b;border-radius:12px;padding:20px;border-left:5px solid #4ade80;}
.label{font-size:0.9rem;color:#9ca3af;}
.value{font-size:1.7rem;font-weight:600;}
.unit{font-size:1rem;color:#4ade80;margin-left:4px;}
.badge{display:inline-block;padding:4px 10px;border-radius:6px;font-size:0.8rem;margin:10px 0;}
.badge-ok{background:#166534;color:#4ade80;}
.badge-fail{background:#991b1b;color:#f87171;}
.alert{background:#f87171;color:#1f2937;padding:10px;border-radius:8px;margin:15px 0;font-weight:600;display:none;}
button{padding:10px 25px;font-size:1rem;border:none;border-radius:8px;cursor:pointer;margin-top:20px;}
.on{background:#4ade80;color:#0f172a;}
.off{background:#f87171;color:#0f172a;}
.footer{font-size:0.8rem;color:#9ca3af;margin-top:30px;}
</style>
</head>
<body>
<div class="container">
  <h1>Smart Energy Monitor</h1>
  <p>Live readings from PZEM-004T • Synced to EnergyIQ</p>
  <div id="pzem-alert" class="alert">No response from PZEM module</div>
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
    <p>Relay: <b id="relay-status">OFF</b></p>
  </div>
  <div class="footer">ESP IP: <span id="ip">%IP%</span> | Refresh: 2s</div>
</div>
<script>
function u(){fetch('/readings').then(r=>r.json()).then(d=>{
  if(d.ok){document.getElementById('pzem-alert').style.display='none';
  document.getElementById('voltage').textContent=d.voltage.toFixed(1);
  document.getElementById('current').textContent=d.current.toFixed(2);
  document.getElementById('power').textContent=d.power.toFixed(1);
  document.getElementById('energy').textContent=d.energy.toFixed(3);
  document.getElementById('frequency').textContent=d.frequency.toFixed(1);
  document.getElementById('pf').textContent=d.pf.toFixed(2);
  document.getElementById('relay-status').textContent=d.relay?"ON":"OFF";
  var b=document.getElementById('relay-btn');b.textContent=d.relay?"Turn OFF":"Turn ON";b.className=d.relay?"off":"on";
  var x=document.getElementById('backend-badge');x.textContent=d.backend?"EnergyIQ: Syncing":"EnergyIQ: Failed";x.className='badge '+(d.backend?'badge-ok':'badge-fail');}
  else document.getElementById('pzem-alert').style.display='block';
}).catch(()=>document.getElementById('pzem-alert').style.display='block');}
function toggleRelay(){fetch('/toggleRelay').then(u);}
u();setInterval(u,2000);
</script>
</body>
</html>
)rawliteral";
  html.replace("%IP%", WiFi.localIP().toString());
  return html;
}

void handleRoot() { server.send(200, "text/html", getDashboardHTML()); }

void handleToggleRelay() {
  relayState = !relayState;
  digitalWrite(RELAY_PIN, relayState ? LOW : HIGH);
  server.send(200, "text/plain", "OK");
  pushRelayToBackend();
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);

  WiFi.begin(ssid, password);
  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nIP: " + WiFi.localIP().toString());
  Serial.println("Backend: " + String(BACKEND_URL));

  server.on("/", handleRoot);
  server.on("/readings", handleReadings);
  server.on("/toggleRelay", handleToggleRelay);
  server.begin();
}

void loop() {
  server.handleClient();
  yield();

  unsigned long now = millis();

  if (now - lastDevicePoll >= DEVICE_POLL_MS) {
    lastDevicePoll = now;
    syncRelayFromBackend();
  }

  if (now - lastPush >= PUSH_INTERVAL_MS) {
    lastPush = now;
    float v = pzem.voltage();
    float i = pzem.current();
    float p = pzem.power();
    float e = pzem.energy();
    float f = pzem.frequency();
    if (!isnan(v) && !isnan(i) && !isnan(p)) {
      pushToBackend(v, i, p, e, f);
    }
  }
}
