from rest_framework import serializers

from backend.apps.emissions.models import EmissionRecord
from backend.apps.ingestion.models import DataSource, IngestionBatch, Organization, RawRecord
from backend.apps.reviews.models import AuditLog, ReviewAction


class ReviewQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmissionRecord
        fields = [
            "id",
            "organization_id",
            "data_source_id",
            "raw_record_id",
            "activity_category",
            "scope",
            "activity_date",
            "period_start",
            "period_end",
            "emission_amount_kgco2e",
            "review_status",
            "suspicious_flags",
            "is_locked",
        ]


class ReviewActionSerializer(serializers.Serializer):
    organization_id = serializers.IntegerField()
    emission_record_id = serializers.IntegerField()
    action = serializers.ChoiceField(choices=ReviewAction.Action.choices)
    reviewer_name = serializers.CharField(max_length=128)
    reason = serializers.CharField(allow_blank=True, required=False)

    def validate(self, attrs):
        organization_id = attrs["organization_id"]
        emission_record_id = attrs["emission_record_id"]
        action = attrs["action"]
        reason = attrs.get("reason", "")

        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist as exc:
            raise serializers.ValidationError("unknown_organization") from exc

        try:
            record = EmissionRecord.objects.get(
                id=emission_record_id, organization=organization
            )
        except EmissionRecord.DoesNotExist as exc:
            raise serializers.ValidationError("unknown_emission_record") from exc

        if record.is_locked:
            raise serializers.ValidationError("record_locked")

        if action == ReviewAction.Action.REJECT and reason.strip() == "":
            raise serializers.ValidationError("reject_requires_reason")

        attrs["organization"] = organization
        attrs["emission_record"] = record
        attrs["reason"] = reason
        return attrs


class ReviewHistorySerializer(serializers.Serializer):
    review_actions = serializers.ListField()
    audit_logs = serializers.ListField()


class ReviewActionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewAction
        fields = [
            "id",
            "action",
            "reviewer_name",
            "reason",
            "created_at",
        ]


class AuditLogListSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = [
            "id",
            "event",
            "actor",
            "occurred_at",
            "from_status",
            "to_status",
            "metadata",
        ]


class DataSourceSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSource
        fields = ["id", "name", "source_type", "created_at"]


class IngestionBatchSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = IngestionBatch
        fields = [
            "id",
            "received_at",
            "raw_file_name",
            "raw_file_sha256",
            "record_count",
            "notes",
        ]


class RawRecordSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = RawRecord
        fields = [
            "id",
            "received_at",
            "source_record_id",
            "source_row_number",
            "raw_payload",
            "raw_text",
            "raw_hash_sha256",
            "ingest_status",
            "suspicious_flags",
            "error_message",
        ]


class EmissionRecordDetailSerializer(serializers.ModelSerializer):
    data_source = DataSourceSummarySerializer(read_only=True)
    raw_record = RawRecordSummarySerializer(read_only=True)
    ingestion_batch = IngestionBatchSummarySerializer(
        source="raw_record.ingestion_batch", read_only=True
    )

    class Meta:
        model = EmissionRecord
        fields = [
            "id",
            "data_source",
            "raw_record",
            "ingestion_batch",
            "activity_category",
            "scope",
            "activity_date",
            "period_start",
            "period_end",
            "quantity",
            "quantity_unit",
            "normalized_quantity",
            "normalized_unit",
            "emission_factor",
            "emission_factor_unit",
            "emission_amount_kgco2e",
            "location",
            "supplier",
            "travel_mode",
            "class_of_travel",
            "review_status",
            "suspicious_flags",
            "is_locked",
            "locked_at",
            "locked_snapshot",
            "created_at",
            "updated_at",
        ]
