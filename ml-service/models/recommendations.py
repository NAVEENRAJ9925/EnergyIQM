"""Energy saving recommendations (rule-based + usage pattern analysis)."""
import numpy as np
import pandas as pd


def get_recommendations(readings: list[dict], peak_hours: list[str], anomalies_count: int) -> list[dict]:
    """
    Generate personalized tips based on usage patterns.
    """
    if not readings:
        return [
            {"tip": "Start monitoring your energy to get personalized tips.", "potential_saving": "10%"},
        ]

    df = pd.DataFrame(readings)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["hour"] = df["timestamp"].dt.hour

    tips = []
    power = df["power"].values
    avg_power = np.mean(power)
    max_power = np.max(power)

    # Peak hours recommendation
    peak_nums = [int(h.split("-")[0].split(":")[0]) for h in peak_hours if h]
    evening_peak = any(19 <= h <= 23 for h in peak_nums)
    if evening_peak:
        tips.append({
            "tip": "Shift non-essential loads (washing, charging) outside 7–11 PM to reduce peak tariffs.",
            "potential_saving": "15%",
        })

    # High standby / baseline
    if avg_power > 200:
        tips.append({
            "tip": "High baseline consumption detected. Unplug devices on standby and use smart plugs.",
            "potential_saving": "10%",
        })

    # Spikes / anomalies
    if anomalies_count > 2:
        tips.append({
            "tip": f"Unusual consumption spikes detected ({anomalies_count}). Review running appliances during spike times.",
            "potential_saving": "12%",
        })

    # High max power (likely AC / heater)
    if max_power > 1500:
        tips.append({
            "tip": "Replace old AC with 5-star rated inverter AC to save ~30% on cooling.",
            "potential_saving": "30%",
        })

    # General tip
    if len(tips) < 2:
        tips.append({
            "tip": "Use LED bulbs and schedule heavy appliances during off-peak hours.",
            "potential_saving": "8%",
        })

    return tips[:5]
