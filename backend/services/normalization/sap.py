from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Tuple

from backend.apps.emissions.models import EmissionRecord


@dataclass
class NormalizedSapRecord:
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
    supplier: str


FUEL_KEYWORDS = {"DIESEL", "BENZIN", "KRAFTSTOFF", "HEIZOEL"}

PLANT_LOCATION_MAP: Dict[str, str] = {
    "1000": "DE-HH",
    "1100": "DE-MU",
    "2000": "DE-BE",
}

UNIT_NORMALIZATION = {
    "L": ("L", 1.0),
    "LTR": ("L", 1.0),
    "KG": ("KG", 1.0),
    "T": ("KG", 1000.0),
    "KWH": ("KWH", 1.0),
    "MWH": ("KWH", 1000.0),
}

EMISSION_FACTORS = {
    ("FUEL", "L"): (2.68, "kgco2e/L"),
    ("FUEL", "KG"): (3.15, "kgco2e/kg"),
    ("PROCUREMENT", "KG"): (1.50, "kgco2e/kg"),
}


def classify_activity(material_text: str) -> str:
    text = material_text.upper()
    if any(keyword in text for keyword in FUEL_KEYWORDS):
        return EmissionRecord.ActivityCategory.FUEL_COMBUSTION
    return EmissionRecord.ActivityCategory.PROCUREMENT


def to_scope(activity_category: str) -> str:
    if activity_category == EmissionRecord.ActivityCategory.FUEL_COMBUSTION:
        return EmissionRecord.Scope.SCOPE_1
    return EmissionRecord.Scope.SCOPE_3


def normalize_unit(unit: str, quantity: float) -> Tuple[float, str]:
    key = unit.upper().replace(" ", "")
    if key not in UNIT_NORMALIZATION:
        return quantity, unit
    normalized_unit, factor = UNIT_NORMALIZATION[key]
    return quantity * factor, normalized_unit


def emission_factor_for(activity_category: str, unit: str) -> Tuple[float, str]:
    if activity_category == EmissionRecord.ActivityCategory.FUEL_COMBUSTION:
        return EMISSION_FACTORS.get(("FUEL", unit), (0.0, "kgco2e/unit"))
    return EMISSION_FACTORS.get(("PROCUREMENT", unit), (0.0, "kgco2e/unit"))


def normalize_record(
    material_text: str,
    quantity: float,
    unit: str,
    plant_code: str,
    supplier: str,
) -> NormalizedSapRecord:
    activity_category = classify_activity(material_text)
    scope = to_scope(activity_category)

    normalized_quantity, normalized_unit = normalize_unit(unit, quantity)
    emission_factor, emission_factor_unit = emission_factor_for(
        activity_category, normalized_unit
    )
    emission_amount = normalized_quantity * emission_factor

    location = PLANT_LOCATION_MAP.get(plant_code, f"PLANT:{plant_code}")

    return NormalizedSapRecord(
        activity_category=activity_category,
        scope=scope,
        quantity=quantity,
        quantity_unit=unit,
        normalized_quantity=normalized_quantity,
        normalized_unit=normalized_unit,
        emission_factor=emission_factor,
        emission_factor_unit=emission_factor_unit,
        emission_amount_kgco2e=emission_amount,
        location=location,
        supplier=supplier,
    )


def plant_is_unknown(plant_code: str) -> bool:
    return plant_code not in PLANT_LOCATION_MAP


def unit_is_unknown(unit: str) -> bool:
    key = unit.upper().replace(" ", "")
    return key not in UNIT_NORMALIZATION


def zero_emission_factor(activity_category: str, unit: str) -> bool:
    factor, _ = emission_factor_for(activity_category, unit)
    return factor == 0.0
