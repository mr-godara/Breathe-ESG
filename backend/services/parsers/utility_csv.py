from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import Any, Dict, Iterable, List, Optional

import pandas as pd

UTILITY_COLUMN_MAP = {
    "Meter ID": "meter_id",
    "Meter_ID": "meter_id",
    "Billing Start": "billing_start",
    "Billing End": "billing_end",
    "Usage": "usage",
    "Usage kWh": "usage",
    "Unit": "unit",
    "Service Region": "service_region",
    "Account": "account_id",
}


@dataclass
class ParsedUtilityRow:
    raw: Dict[str, Any]
    meter_id: str
    billing_start: Optional[date]
    billing_end: Optional[date]
    usage: Optional[float]
    unit: str
    service_region: str
    account_id: str
    errors: List[str]


def read_utility_csv(file_obj) -> pd.DataFrame:
    return pd.read_csv(
        file_obj,
        sep=",",
        dtype=str,
        keep_default_na=False,
        encoding="utf-8",
    )


def map_headers(row: Dict[str, Any]) -> Dict[str, Any]:
    mapped: Dict[str, Any] = {}
    for key, value in row.items():
        mapped_key = UTILITY_COLUMN_MAP.get(key, key)
        mapped[mapped_key] = value
    return mapped


def parse_decimal(value: str) -> Optional[float]:
    if value is None:
        return None
    value = value.strip()
    if value == "":
        return None
    normalized = value.replace(",", "")
    try:
        return float(normalized)
    except ValueError:
        return None


def parse_date(value: str) -> Optional[date]:
    if value is None:
        return None
    value = value.strip()
    if value == "":
        return None
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d.%m.%Y"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


def parse_rows(df: pd.DataFrame) -> Iterable[ParsedUtilityRow]:
    for _, row in df.iterrows():
        raw = {str(k): ("" if pd.isna(v) else v) for k, v in row.to_dict().items()}
        mapped = map_headers(raw)
        errors: List[str] = []

        billing_start = parse_date(mapped.get("billing_start", ""))
        billing_end = parse_date(mapped.get("billing_end", ""))
        usage = parse_decimal(mapped.get("usage", ""))

        if billing_start is None or billing_end is None:
            errors.append("invalid_billing_period")

        meter_id = str(mapped.get("meter_id", "")).strip()
        unit = str(mapped.get("unit", "")).strip()
        service_region = str(mapped.get("service_region", "")).strip()
        account_id = str(mapped.get("account_id", "")).strip()

        if meter_id == "":
            errors.append("missing_meter_id")
        if unit == "":
            errors.append("missing_unit")
        if usage is None:
            errors.append("invalid_usage")

        yield ParsedUtilityRow(
            raw=raw,
            meter_id=meter_id,
            billing_start=billing_start,
            billing_end=billing_end,
            usage=usage,
            unit=unit,
            service_region=service_region,
            account_id=account_id,
            errors=errors,
        )
