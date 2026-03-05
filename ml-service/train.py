"""
Batch training script for EnergyIQ ML models.
Run periodically (cron) or on-demand to refresh models.
"""
import os
import sys

# Ensure project root
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils.db import get_readings
from models.consumption import predict_monthly_consumption


def main():
    print("EnergyIQ ML – Training / validation run")
    readings = get_readings(user_id=None, days=90)
    print(f"  Fetched {len(readings)} readings")

    pred, conf = predict_monthly_consumption(readings)
    print(f"  Predicted monthly consumption: {pred} kWh (confidence: {conf})")

    print("Done.")


if __name__ == "__main__":
    main()
