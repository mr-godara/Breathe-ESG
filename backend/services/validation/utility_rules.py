from __future__ import annotations

from datetime import date
from typing import Iterable, List, Tuple

from backend.services.normalization.utility import unit_is_unknown


def has_overlapping_period(
    billing_start: date | None,
    billing_end: date | None,
    existing_periods: Iterable[Tuple[date, date]],
) -> bool:
    if not billing_start or not billing_end:
        return False
    for existing_start, existing_end in existing_periods:
        if billing_start <= existing_end and billing_end >= existing_start:
            return True
    return False


def suspicious_flags(
    usage: float,
    unit: str,
    billing_start: date | None,
    billing_end: date | None,
    overlapping_period: bool = False,
) -> List[str]:
    flags: List[str] = []
    if usage < 0:
        flags.append("negative_usage")
    if unit_is_unknown(unit):
        flags.append("unknown_unit")
    if usage > 10_000_000:
        flags.append("extreme_usage")

    if overlapping_period:
        flags.append("overlapping_billing_period")

    if billing_start and billing_end:
        if billing_end < billing_start:
            flags.append("billing_end_before_start")
        period_days = (billing_end - billing_start).days
        if period_days > 60:
            flags.append("long_billing_period")
        if period_days < 10:
            flags.append("short_billing_period")
        if period_days > 0:
            usage_per_day = usage / period_days
            if usage_per_day > 200_000:
                flags.append("usage_spike")
    else:
        flags.append("missing_billing_period")

    return flags
