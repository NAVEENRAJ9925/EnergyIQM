"""Anomaly detection using Isolation Forest and Z-Score."""
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from datetime import datetime


def detect_anomalies(readings: list[dict], z_threshold: float = 2.0) -> list[dict]:
    """
    Detect unusual spikes in power consumption.
    Uses both Z-Score (>2 std from rolling mean) and Isolation Forest.
    """
    if not readings or len(readings) < 10:
        return []

    df = pd.DataFrame(readings)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)

    power = df["power"].values
    rolling_mean = pd.Series(power).rolling(20, min_periods=5).mean()
    rolling_std = pd.Series(power).rolling(20, min_periods=5).std().fillna(0)
    z_scores = np.where(rolling_std > 0, np.abs((power - rolling_mean) / rolling_std), 0)

    anomalies = []
    iso = IsolationForest(contamination=0.1, random_state=42)
    iso_pred = iso.fit_predict(np.array(power).reshape(-1, 1))

    for i in range(len(df)):
        is_z_anomaly = z_scores[i] > z_threshold
        is_iso_anomaly = iso_pred[i] == -1
        if is_z_anomaly or is_iso_anomaly:
            ts = df.iloc[i]["timestamp"]
            pwr = float(df.iloc[i]["power"])
            expected = float(rolling_mean.iloc[i]) if not np.isnan(rolling_mean.iloc[i]) else np.mean(power)
            severity = "high" if pwr > expected * 1.5 else "medium"
            anomalies.append({
                "timestamp": ts.isoformat() if hasattr(ts, "isoformat") else str(ts),
                "power": round(pwr, 2),
                "expected": round(expected, 2),
                "severity": severity,
            })

    return anomalies[:50]
