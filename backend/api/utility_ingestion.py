from __future__ import annotations

from typing import Any, Dict, List

from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from backend.apps.emissions.models import EmissionRecord
from backend.apps.ingestion.models import IngestionBatch, RawRecord
from backend.api.serializers import UtilityUploadSerializer
from backend.services.normalization.utility import normalize_record
from backend.services.parsers.utility_csv import parse_rows, read_utility_csv
from backend.services.validation.utility_rules import (
    has_overlapping_period,
    suspicious_flags,
)


class UtilityCsvUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UtilityUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data_source = serializer.validated_data["data_source"]
        organization = serializer.validated_data["organization"]
        file_obj = serializer.validated_data["file"]

        batch = IngestionBatch.objects.create(
            data_source=data_source,
            raw_file_name=file_obj.name,
        )

        df = read_utility_csv(file_obj)

        created_records = 0
        error_rows: List[Dict[str, Any]] = []
        meter_periods: Dict[str, List[tuple]] = {}

        with transaction.atomic():
            for index, parsed in enumerate(parse_rows(df), start=1):
                raw_record = RawRecord.objects.create(
                    data_source=data_source,
                    ingestion_batch=batch,
                    organization=organization,
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

                normalized = normalize_record(
                    usage=parsed.usage or 0.0,
                    unit=parsed.unit,
                    service_region=parsed.service_region,
                )

                existing_periods = meter_periods.get(parsed.meter_id, [])
                overlap = has_overlapping_period(
                    parsed.billing_start,
                    parsed.billing_end,
                    existing_periods,
                )

                flags = suspicious_flags(
                    usage=parsed.usage or 0.0,
                    unit=parsed.unit,
                    billing_start=parsed.billing_start,
                    billing_end=parsed.billing_end,
                    overlapping_period=overlap,
                )

                if parsed.billing_start and parsed.billing_end:
                    meter_periods.setdefault(parsed.meter_id, []).append(
                        (parsed.billing_start, parsed.billing_end)
                    )

                EmissionRecord.objects.create(
                    organization=organization,
                    data_source=data_source,
                    raw_record=raw_record,
                    activity_category=normalized.activity_category,
                    scope=normalized.scope,
                    activity_date=parsed.billing_end,
                    period_start=parsed.billing_start,
                    period_end=parsed.billing_end,
                    quantity=normalized.quantity,
                    quantity_unit=normalized.quantity_unit,
                    normalized_quantity=normalized.normalized_quantity,
                    normalized_unit=normalized.normalized_unit,
                    emission_factor=normalized.emission_factor,
                    emission_factor_unit=normalized.emission_factor_unit,
                    emission_amount_kgco2e=normalized.emission_amount_kgco2e,
                    location=normalized.location,
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

        return Response(
            {
                "batch_id": batch.id,
                "created_records": created_records,
                "error_rows": error_rows,
            },
            status=status.HTTP_201_CREATED,
        )
