from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import Any, Dict, Iterable, List, Optional, Tuple

import pandas as pd

SAP_COLUMN_MAP = {
    "Belegdatum": "document_date",
    "Buchungskreis": "company_code",
    "Werk": "plant_code",
    "Material": "material_code",
    "Materialkurztext": "material_text",
    "Menge": "quantity",
    "Einheit": "unit",
    "Lieferant": "supplier",
    "Waehrung": "currency",
    "Wert": "amount",
}

ALTERNATE_HEADERS = {
    "Dokumentdatum": "Belegdatum",
    "Werkcode": "Werk",
    "Lieferantennr": "Lieferant",
}


@dataclass
class ParsedSapRow:
    raw: Dict[str, Any]
    document_date: Optional[date]
    plant_code: str
    material_code: str
    material_text: str
    quantity: Optional[float]
    unit: str
    supplier: str
    company_code: str
    amount: Optional[float]
    currency: str
    errors: List[str]


def read_sap_csv(file_obj) -> pd.DataFrame:
    return pd.read_csv(
        file_obj,
        sep=";",
        dtype=str,
        keep_default_na=False,
        encoding="utf-8",
    )


def normalize_headers(df: pd.DataFrame) -> pd.DataFrame:
    headers = {col: ALTERNATE_HEADERS.get(col, col) for col in df.columns}
    return df.rename(columns=headers)


def map_headers(row: Dict[str, Any]) -> Dict[str, Any]:
    mapped: Dict[str, Any] = {}
    for key, value in row.items():
        mapped_key = SAP_COLUMN_MAP.get(key, key)
        mapped[mapped_key] = value
    return mapped


def parse_decimal(value: str) -> Optional[float]:
    if value is None:
        return None
    value = value.strip()
    if value == "":
        return None
    normalized = value.replace(".", "").replace(",", ".")
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
    for fmt in ("%d.%m.%Y", "%Y-%m-%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


def parse_rows(df: pd.DataFrame) -> Iterable[ParsedSapRow]:
    for _, row in df.iterrows():
        raw = {str(k): ("" if pd.isna(v) else v) for k, v in row.to_dict().items()}
        mapped = map_headers(raw)
        errors: List[str] = []

        doc_date = parse_date(mapped.get("document_date", ""))
        if doc_date is None:
            errors.append("invalid_date")

        quantity = parse_decimal(mapped.get("quantity", ""))
        if quantity is None:
            errors.append("invalid_quantity")

        amount = parse_decimal(mapped.get("amount", ""))

        plant_code = str(mapped.get("plant_code", "")).strip()
        material_code = str(mapped.get("material_code", "")).strip()
        material_text = str(mapped.get("material_text", "")).strip()
        unit = str(mapped.get("unit", "")).strip()
        supplier = str(mapped.get("supplier", "")).strip()
        company_code = str(mapped.get("company_code", "")).strip()
        currency = str(mapped.get("currency", "")).strip()

        if plant_code == "":
            errors.append("missing_plant_code")
        if unit == "":
            errors.append("missing_unit")

        yield ParsedSapRow(
            raw=raw,
            document_date=doc_date,
            plant_code=plant_code,
            material_code=material_code,
            material_text=material_text,
            quantity=quantity,
            unit=unit,
            supplier=supplier,
            company_code=company_code,
            amount=amount,
            currency=currency,
            errors=errors,
        )
