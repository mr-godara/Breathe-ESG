from __future__ import annotations

from datetime import date
from typing import Any, Dict, List

from django.db import transaction

from backend.apps.emissions.models import EmissionRecord
from backend.apps.ingestion.models import DataSource, IngestionBatch, Organization, RawRecord
from backend.services.normalization.travel import (
    missing_emission_factor,
    normalize_record,
)
from backend.services.parsers.travel_api import TravelApiClient, parse_trip
from backend.services.validation.travel_rules import suspicious_flags


class TravelIngestionService:
    def __init__(self, api_client: TravelApiClient):
        self.api_client = api_client

    def ingest(self, organization: Organization, data_source: DataSource, since: date):
        if data_source.source_type != DataSource.SourceType.TRAVEL:
            raise ValueError("data_source_not_travel")

        batch = IngestionBatch.objects.create(
            data_source=data_source,
            notes=f"Travel API sync since {since.isoformat()}",
        )

        created_records = 0
        error_rows: List[Dict[str, Any]] = []

        with transaction.atomic():
            for index, raw_trip in enumerate(self.api_client.fetch_trips(since), start=1):
                parsed = parse_trip(raw_trip)
                raw_record = RawRecord.objects.create(
                    data_source=data_source,
                    ingestion_batch=batch,
                    organization=organization,
                    source_record_id=parsed.trip_id,
                    source_row_number=index,
                    raw_payload=parsed.raw,
                    ingest_status=RawRecord.IngestStatus.PARSED,
                    suspicious_flags=parsed.errors,
                    error_message=";".join(parsed.errors),
                )

                if parsed.errors:
                    raw_record.ingest_status = RawRecord.IngestStatus.ERROR
                    raw_record.save(update_fields=["ingest_status"])
                    error_rows.append({"row": index, "errors": parsed.errors})
                    continue

                flags = suspicious_flags(
                    distance_km=parsed.distance_km,
                    travel_category=parsed.travel_category,
                    airport_from=parsed.departure_airport,
                    airport_to=parsed.arrival_airport,
                )

                distance_km = parsed.distance_km or 0.0
                normalized = normalize_record(
                    travel_category=parsed.travel_category,
                    cabin_class=parsed.cabin_class,
                    distance_km=distance_km,
                )

                if missing_emission_factor(
                    normalized.travel_mode, normalized.class_of_travel
                ):
                    flags.append("missing_emission_factor")

                EmissionRecord.objects.create(
                    organization=organization,
                    data_source=data_source,
                    raw_record=raw_record,
                    activity_category=normalized.activity_category,
                    scope=normalized.scope,
                    activity_date=parsed.travel_date,
                    quantity=normalized.quantity,
                    quantity_unit=normalized.quantity_unit,
                    normalized_quantity=normalized.normalized_quantity,
                    normalized_unit=normalized.normalized_unit,
                    emission_factor=normalized.emission_factor,
                    emission_factor_unit=normalized.emission_factor_unit,
                    emission_amount_kgco2e=normalized.emission_amount_kgco2e,
                    travel_mode=normalized.travel_mode,
                    class_of_travel=normalized.class_of_travel,
                    review_status=EmissionRecord.ReviewStatus.PENDING,
                    suspicious_flags=flags,
                )

                raw_record.ingest_status = RawRecord.IngestStatus.NORMALIZED
                raw_record.suspicious_flags = list(
                    set(raw_record.suspicious_flags + flags)
                )
                raw_record.save(update_fields=["ingest_status", "suspicious_flags"])
                created_records += 1

        batch.record_count = created_records
        batch.save(update_fields=["record_count"])
        return {
            "batch_id": batch.id,
            "created_records": created_records,
            "error_rows": error_rows,
        }
