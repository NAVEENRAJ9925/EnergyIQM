"""Monthly consumption prediction using Linear Regression."""
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.linear_model import LinearRegression


def predict_monthly_consumption(readings: list[dict]) -> tuple[float, float]:
    """
    Input: list of energy readings with timestamp, energy
    Output: (predicted_units, confidence)
    """
    if not readings or len(readings) < 7:
        return 0.0, 0.0

    df = pd.DataFrame(readings)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    daily = df.resample("D", on="timestamp")["energy"].sum().reset_index()
    daily.columns = ["date", "energy"]

    if len(daily) < 5:
        return float(daily["energy"].sum()), 0.5

    X = np.arange(len(daily)).reshape(-1, 1)
    y = daily["energy"].values
    model = LinearRegression().fit(X, y)
    r2 = model.score(X, y)
    confidence = max(0.5, min(0.95, r2 + 0.3))

    days_elapsed = (datetime.utcnow() - daily["date"].max()).days
    days_remaining = max(0, 30 - datetime.utcnow().day)
    days_in_month = datetime.utcnow().replace(day=28) + pd.Timedelta(days=4)
    days_in_month = days_in_month.day

    extrapolate = len(daily) + days_remaining
    pred_daily = model.predict([[extrapolate - 1]])[0]
    pred_monthly = daily["energy"].sum() + max(0, pred_daily * days_remaining)

    return round(float(pred_monthly), 2), round(float(confidence), 2)
