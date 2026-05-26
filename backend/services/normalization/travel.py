from __future__ import annotations

from dataclasses import dataclass
from typing import Tuple

from backend.apps.emissions.models import EmissionRecord


@dataclass
class NormalizedTravelRecord:
    activity_category: str
    scope: str
    quantity: float
    quantity_unit: str
    normalized_quantity: float
    normalized_unit: str
    emission_factor: float
    emission_factor_unit: str
    emission_amount_kgco2e: float
    travel_mode: str
    class_of_travel: str


CATEGORY_MODE = {
    "AIR": "AIR",
    "RAIL": "RAIL",
    "CAR": "CAR",
}

EMISSION_FACTORS = {
    ("AIR", "ECONOMY"): 0.15,
    ("AIR", "BUSINESS"): 0.28,
    ("AIR", "FIRST"): 0.4,
    ("RAIL", "ECONOMY"): 0.04,
    ("CAR", "ECONOMY"): 0.21,
}


def normalize_record(
    travel_category: str,
    cabin_class: str,
    distance_km: float,
) -> NormalizedTravelRecord:
    travel_mode = CATEGORY_MODE.get(travel_category, "UNKNOWN")
    class_of_travel = cabin_class or "UNKNOWN"

    emission_factor = EMISSION_FACTORS.get(
        (travel_mode, class_of_travel), 0.0
    )
    emission_amount = distance_km * emission_factor

    return NormalizedTravelRecord(
        activity_category=EmissionRecord.ActivityCategory.BUSINESS_TRAVEL,
        scope=EmissionRecord.Scope.SCOPE_3,
        quantity=distance_km,
        quantity_unit="KM",
        normalized_quantity=distance_km,
        normalized_unit="KM",
        emission_factor=emission_factor,
        emission_factor_unit="kgco2e/km",
        emission_amount_kgco2e=emission_amount,
        travel_mode=travel_mode,
        class_of_travel=class_of_travel,
    )


def missing_emission_factor(travel_mode: str, class_of_travel: str) -> bool:
    return EMISSION_FACTORS.get((travel_mode, class_of_travel), 0.0) == 0.0
