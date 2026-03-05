"""Flask ML microservice for EnergyIQ insights."""
import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS

from utils.db import get_readings
from utils.tariff import calculate_bill
from models.consumption import predict_monthly_consumption
from models.anomaly import detect_anomalies
from models.peak_detection import detect_peak_hours
from models.carbon import carbon_footprint
from models.recommendations import get_recommendations

app = Flask(__name__)
CORS(app)

DAYS_DEFAULT = 90


@app.route("/")
def root():
    return jsonify({"service": "energyiq-ml", "status": "ok", "port": os.getenv("PORT", "5001")})


def _readings(user_id: str = None, days: int = DAYS_DEFAULT):
    return get_readings(user_id=user_id, days=days)


@app.route("/api/ml/predict-consumption", methods=["GET"])
def predict_consumption():
    """Monthly consumption prediction (last 90 days)."""
    user_id = request.args.get("userId") or request.args.get("user_id")
    days = int(request.args.get("days", DAYS_DEFAULT))
    readings = _readings(user_id=user_id, days=days)
    pred, conf = predict_monthly_consumption(readings)
    return jsonify({"predicted_units": pred, "confidence": conf})


@app.route("/api/ml/predict-bill", methods=["GET"])
def predict_bill():
    """Bill estimation using predicted units and TNEB tariff."""
    user_id = request.args.get("userId") or request.args.get("user_id")
    days = int(request.args.get("days", DAYS_DEFAULT))
    readings = _readings(user_id=user_id, days=days)
    pred, _ = predict_monthly_consumption(readings)
    total, breakdown = calculate_bill(pred)
    return jsonify({
        "predicted_units": pred,
        "estimated_bill": total,
        "breakdown": breakdown,
    })


@app.route("/api/ml/peak-hours", methods=["GET"])
def peak_hours():
    """Top 3 peak usage hours."""
    user_id = request.args.get("userId") or request.args.get("user_id")
    days = int(request.args.get("days", DAYS_DEFAULT))
    readings = _readings(user_id=user_id, days=days)
    result = detect_peak_hours(readings, top_n=3)
    return jsonify(result)


@app.route("/api/ml/anomalies", methods=["GET"])
def anomalies():
    """Unusual consumption spikes (Z-Score + Isolation Forest)."""
    user_id = request.args.get("userId") or request.args.get("user_id")
    days = int(request.args.get("days", DAYS_DEFAULT))
    readings = _readings(user_id=user_id, days=days)
    anomalies_list = detect_anomalies(readings)
    return jsonify({"anomalies": anomalies_list})


@app.route("/api/ml/recommendations", methods=["GET"])
def recommendations():
    """Energy saving recommendations."""
    user_id = request.args.get("userId") or request.args.get("user_id")
    days = int(request.args.get("days", DAYS_DEFAULT))
    readings = _readings(user_id=user_id, days=days)
    peak = detect_peak_hours(readings, top_n=3)
    anomalies_list = detect_anomalies(readings)
    recs = get_recommendations(readings, peak["peak_hours"], len(anomalies_list))
    return jsonify({"recommendations": recs})


@app.route("/api/ml/carbon-footprint", methods=["GET"])
def carbon():
    """Carbon footprint estimation (India grid factor 0.82 kg/kWh)."""
    user_id = request.args.get("userId") or request.args.get("user_id")
    days = int(request.args.get("days", DAYS_DEFAULT))
    readings = _readings(user_id=user_id, days=days)
    if not readings:
        return jsonify({
            "total_kwh": 0,
            "co2_kg": 0,
            "co2_factor": 0.82,
            "vs_regional_avg": "unknown",
            "pct_diff_from_avg": 0,
            "regional_avg_kwh": 250,
        })
    import pandas as pd
    df = pd.DataFrame(readings)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    total = df["energy"].sum()
    result = carbon_footprint(total)
    return jsonify(result)


@app.route("/api/ml/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "energyiq-ml"})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    print(f"EnergyIQ ML service starting on http://0.0.0.0:{port}")
    print("  Test: curl http://localhost:5001/ or http://localhost:5001/api/ml/health")
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "0") == "1")
