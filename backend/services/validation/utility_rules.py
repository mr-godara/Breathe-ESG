from __future__ import annotations

from datetime import date
from typing import List

from backend.services.normalization.utility import unit_is_unknown


def suspicious_flags(
    usage: float,
    unit: str,
    billing_start: date | None,
    billing_end: date | None,
) -> List[str]:
    flags: List[str] = []
    if usage < 0:
        flags.append("negative_usage")
    if unit_is_unknown(unit):
        flags.append("unknown_unit")
    if usage > 10_000_000:
        flags.append("extreme_usage")

    if billing_start and billing_end:
        if billing_end < billing_start:
            flags.append("billing_end_before_start")
        period_days = (billing_end - billing_start).days
        if period_days > 60:
            flags.append("long_billing_period")
        if period_days < 10:
            flags.append("short_billing_period")
    else:
        flags.append("missing_billing_period")

    return flags
