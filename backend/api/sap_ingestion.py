from __future__ import annotations

from typing import Any, Dict, List

from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from backend.apps.emissions.models import EmissionRecord
from backend.apps.ingestion.models import IngestionBatch, RawRecord
from backend.api.serializers import SapUploadSerializer
from backend.services.normalization.sap import normalize_record, zero_emission_factor
from backend.services.parsers.sap_csv import normalize_headers, parse_rows, read_sap_csv
from backend.services.validation.sap_rules import plant_flags, suspicious_flags


class SapCsvUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = SapUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data_source = serializer.validated_data["data_source"]
        organization = serializer.validated_data["organization"]
        file_obj = serializer.validated_data["file"]

        batch = IngestionBatch.objects.create(
            data_source=data_source,
            raw_file_name=file_obj.name,
        )

        df = read_sap_csv(file_obj)
        df = normalize_headers(df)

        created_records = 0
        error_rows: List[Dict[str, Any]] = []

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
                    error_rows.append(
                        {"row": index, "errors": parsed.errors}
                    )
                    continue

                normalized = normalize_record(
                    material_text=parsed.material_text,
                    quantity=parsed.quantity or 0.0,
                    unit=parsed.unit,
                    plant_code=parsed.plant_code,
                    supplier=parsed.supplier,
                )

                flags = suspicious_flags(
                    quantity=parsed.quantity or 0.0,
                    unit=parsed.unit,
                    activity_category=normalized.activity_category,
                    has_invalid_date="invalid_date" in parsed.errors,
                )
                flags.extend(plant_flags(parsed.plant_code))
                if zero_emission_factor(normalized.activity_category, normalized.normalized_unit):
                    flags.append("missing_emission_factor")

                EmissionRecord.objects.create(
                    organization=organization,
                    data_source=data_source,
                    raw_record=raw_record,
                    activity_category=normalized.activity_category,
                    scope=normalized.scope,
                    activity_date=parsed.document_date,
                    quantity=normalized.quantity,
                    quantity_unit=normalized.quantity_unit,
                    normalized_quantity=normalized.normalized_quantity,
                    normalized_unit=normalized.normalized_unit,
                    emission_factor=normalized.emission_factor,
                    emission_factor_unit=normalized.emission_factor_unit,
                    emission_amount_kgco2e=normalized.emission_amount_kgco2e,
                    location=normalized.location,
                    supplier=normalized.supplier,
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
