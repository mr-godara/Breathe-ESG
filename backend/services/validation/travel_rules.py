from __future__ import annotations

from typing import List


def suspicious_flags(
    distance_km: float | None,
    travel_category: str,
    airport_from: str,
    airport_to: str,
) -> List[str]:
    flags: List[str] = []
    if not airport_from or not airport_to:
        flags.append("missing_airport_code")
    if airport_from == airport_to and airport_from:
        flags.append("same_airport")
    if distance_km is None:
        flags.append("missing_distance")
    elif distance_km < 0:
        flags.append("negative_distance")
    elif distance_km > 20_000:
        flags.append("extreme_distance")

    if travel_category not in {"AIR", "RAIL", "CAR"}:
        flags.append("unknown_travel_category")

    return flags
