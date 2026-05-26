from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Any, Dict, Iterable, List, Optional

import requests


@dataclass
class TravelTrip:
    raw: Dict[str, Any]
    trip_id: str
    traveler_id: str
    departure_airport: str
    arrival_airport: str
    travel_date: Optional[date]
    travel_category: str
    cabin_class: str
    distance_km: Optional[float]
    errors: List[str]


class TravelApiClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key

    def fetch_trips(self, since: date) -> Iterable[Dict[str, Any]]:
        response = requests.get(
            f"{self.base_url}/trips",
            params={"since": since.isoformat()},
            headers={"Authorization": f"Bearer {self.api_key}"},
            timeout=30,
        )
        response.raise_for_status()
        payload = response.json()
        return payload.get("trips", [])


def parse_date(value: Any) -> Optional[date]:
    if not value:
        return None
    try:
        return date.fromisoformat(str(value))
    except ValueError:
        return None


def parse_trip(raw_trip: Dict[str, Any]) -> TravelTrip:
    errors: List[str] = []
    trip_id = str(raw_trip.get("id", "")).strip()
    traveler_id = str(raw_trip.get("traveler_id", "")).strip()
    departure = str(raw_trip.get("from", "")).strip().upper()
    arrival = str(raw_trip.get("to", "")).strip().upper()
    travel_date = parse_date(raw_trip.get("date"))
    travel_category = str(raw_trip.get("category", "")).strip().upper()
    cabin_class = str(raw_trip.get("cabin_class", "")).strip().upper()

    distance_value = raw_trip.get("distance_km")
    distance_km = None
    if distance_value is not None:
        try:
            distance_km = float(distance_value)
        except (TypeError, ValueError):
            errors.append("invalid_distance")

    if not trip_id:
        errors.append("missing_trip_id")
    if not traveler_id:
        errors.append("missing_traveler_id")
    if not departure or not arrival:
        errors.append("missing_airport_code")
    if travel_date is None:
        errors.append("invalid_travel_date")
    if not travel_category:
        errors.append("missing_category")

    return TravelTrip(
        raw=raw_trip,
        trip_id=trip_id,
        traveler_id=traveler_id,
        departure_airport=departure,
        arrival_airport=arrival,
        travel_date=travel_date,
        travel_category=travel_category,
        cabin_class=cabin_class,
        distance_km=distance_km,
        errors=errors,
    )
