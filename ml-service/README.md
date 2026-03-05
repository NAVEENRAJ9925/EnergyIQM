# EnergyIQ ML Service

Python ML microservice for AI-powered energy insights.

## Setup

```bash
cd ml-service
pip install -r requirements.txt
cp .env.example .env   # optional, set MONGO_URI if needed
```

## Run

```bash
python app.py
# or: flask run --port 5001
```

API runs at `http://localhost:5001`.

## Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/ml/predict-consumption | Predicted monthly units |
| GET | /api/ml/predict-bill | Bill estimate + TNEB breakdown |
| GET | /api/ml/peak-hours | Top 3 peak usage hours |
| GET | /api/ml/anomalies | Unusual consumption spikes |
| GET | /api/ml/recommendations | Energy saving tips |
| GET | /api/ml/carbon-footprint | CO2 estimate (0.82 kg/kWh) |

Add `?userId=<ObjectId>` to scope to a user.

## Train

```bash
python train.py
```
