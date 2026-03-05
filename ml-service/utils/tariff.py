"""TNEB (Tamil Nadu Electricity Board) tariff calculator."""
# Slabs: 0–100=Free | 101–200=₹2.25 | 201–400=₹4.50 | 401–500=₹6 | 500+=₹8

SLABS = [
    (100, 0),
    (200, 2.25),
    (400, 4.50),
    (500, 6),
    (float("inf"), 8),
]


def calculate_bill(units: float) -> tuple[float, list[dict]]:
    """
    Returns (total_bill, breakdown).
    breakdown: list of {slab, units, rate, cost}
    """
    breakdown = []
    total = 0.0
    remaining = units
    prev = 0

    for limit, rate in SLABS:
        if remaining <= 0:
            break
        slab_units = min(remaining, limit - prev)
        cost = slab_units * rate
        breakdown.append({
            "slab": f"{int(prev)}–{int(limit) if limit != float('inf') else '500+'} units",
            "units": round(slab_units, 2),
            "rate": rate,
            "cost": round(cost, 2),
        })
        total += cost
        remaining -= slab_units
        prev = limit

    return round(total, 2), breakdown
