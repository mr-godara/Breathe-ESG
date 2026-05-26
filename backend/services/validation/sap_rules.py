from __future__ import annotations

from typing import List

from backend.apps.emissions.models import EmissionRecord
from backend.services.normalization.sap import plant_is_unknown, unit_is_unknown


def suspicious_flags(
    quantity: float,
    unit: str,
    activity_category: str,
    has_invalid_date: bool,
) -> List[str]:
    flags: List[str] = []
    if has_invalid_date:
        flags.append("invalid_date")
    if quantity < 0:
        flags.append("negative_quantity")
    if unit_is_unknown(unit):
        flags.append("unknown_unit")
    if activity_category == EmissionRecord.ActivityCategory.FUEL_COMBUSTION:
        if quantity > 1_000_000:
            flags.append("extreme_fuel_quantity")
    if activity_category == EmissionRecord.ActivityCategory.PROCUREMENT:
        if quantity > 10_000_000:
            flags.append("extreme_procurement_quantity")
    return flags


def plant_flags(plant_code: str) -> List[str]:
    if plant_is_unknown(plant_code):
        return ["unknown_plant_code"]
    return []
