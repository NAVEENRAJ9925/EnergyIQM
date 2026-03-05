"""Peak usage detection via percentile analysis of hourly consumption."""
import numpy as np
import pandas as pd
from datetime import datetime


def detect_peak_hours(readings: list[dict], top_n: int = 3) -> dict:
    """
    Identify top N peak hours by average power consumption.
    Returns peak_hours (e.g. "19:00-20:00") and avg_peak_power.
    """
    if not readings or len(readings) < 24:
        return {
            "peak_hours": ["19:00-20:00", "20:00-21:00", "21:00-22:00"],
            "avg_peak_power": 0,
        }

    df = pd.DataFrame(readings)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["hour"] = df["timestamp"].dt.hour
    hourly = df.groupby("hour")["power"].mean()

    top_hours = hourly.nlargest(top_n)
    peak_hours = [f"{int(h):02d}:00-{int(h)+1:02d}:00" for h in top_hours.index]
    avg_peak = float(top_hours.mean()) if len(top_hours) > 0 else 0

    return {
        "peak_hours": peak_hours,
        "avg_peak_power": round(avg_peak, 2),
    }
