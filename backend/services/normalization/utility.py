from __future__ import annotations

from dataclasses import dataclass
from typing import Tuple

from backend.apps.emissions.models import EmissionRecord


@dataclass
class NormalizedUtilityRecord:
    activity_category: str
    scope: str
    quantity: float
    quantity_unit: str
    normalized_quantity: float
    normalized_unit: str
    emission_factor: float
    emission_factor_unit: str
    emission_amount_kgco2e: float
    location: str


UNIT_NORMALIZATION = {
    "KWH": ("KWH", 1.0),
    "MWH": ("KWH", 1000.0),
    "GWH": ("KWH", 1_000_000.0),
}

DEFAULT_ELECTRICITY_FACTOR = (0.4, "kgco2e/kwh")


def normalize_unit(unit: str, quantity: float) -> Tuple[float, str]:
    key = unit.upper().replace(" ", "")
    if key not in UNIT_NORMALIZATION:
        return quantity, unit
    normalized_unit, factor = UNIT_NORMALIZATION[key]
    return quantity * factor, normalized_unit


def normalize_record(
    usage: float,
    unit: str,
    service_region: str,
) -> NormalizedUtilityRecord:
    normalized_usage, normalized_unit = normalize_unit(unit, usage)
    emission_factor, emission_factor_unit = DEFAULT_ELECTRICITY_FACTOR
    emission_amount = normalized_usage * emission_factor

    return NormalizedUtilityRecord(
        activity_category=EmissionRecord.ActivityCategory.ELECTRICITY,
        scope=EmissionRecord.Scope.SCOPE_2,
        quantity=usage,
        quantity_unit=unit,
        normalized_quantity=normalized_usage,
        normalized_unit=normalized_unit,
        emission_factor=emission_factor,
        emission_factor_unit=emission_factor_unit,
        emission_amount_kgco2e=emission_amount,
        location=service_region,
    )


def unit_is_unknown(unit: str) -> bool:
    key = unit.upper().replace(" ", "")
    return key not in UNIT_NORMALIZATION
