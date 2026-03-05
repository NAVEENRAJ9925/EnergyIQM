"""Carbon footprint estimation (India grid emission factor)."""
# India grid: ~0.82 kg CO2 per kWh (CEA/CERC estimates)
CO2_FACTOR_KG_PER_KWH = 0.82
REGIONAL_AVG_KWH_PER_MONTH = 250  # approx residential avg


def carbon_footprint(total_kwh: float) -> dict:
    """
    CO2_kg = total_kWh × 0.82
    Compare against regional average.
    """
    co2_kg = total_kwh * CO2_FACTOR_KG_PER_KWH
    regional_avg = REGIONAL_AVG_KWH_PER_MONTH
    vs_regional = "below" if total_kwh < regional_avg else "above"
    pct_diff = abs(total_kwh - regional_avg) / regional_avg * 100 if regional_avg > 0 else 0

    return {
        "total_kwh": round(total_kwh, 2),
        "co2_kg": round(co2_kg, 2),
        "co2_factor": CO2_FACTOR_KG_PER_KWH,
        "vs_regional_avg": vs_regional,
        "pct_diff_from_avg": round(pct_diff, 1),
        "regional_avg_kwh": regional_avg,
    }
