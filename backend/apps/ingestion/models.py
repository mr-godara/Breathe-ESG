from django.db import models
from django.utils import timezone


class Organization(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


class DataSource(models.Model):
    class SourceType(models.TextChoices):
        SAP = "SAP", "SAP MM Export"
        UTILITY = "UTILITY", "Utility Portal"
        TRAVEL = "TRAVEL", "Corporate Travel"

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="data_sources"
    )
    source_type = models.CharField(max_length=16, choices=SourceType.choices)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "source_type", "name"],
                name="uniq_datasource_per_org_type_name",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "source_type"]),
        ]

    def __str__(self) -> str:
        return f"{self.organization.slug}:{self.name}"


class IngestionBatch(models.Model):
    data_source = models.ForeignKey(
        DataSource, on_delete=models.PROTECT, related_name="batches"
    )
    received_at = models.DateTimeField(default=timezone.now)
    raw_file_name = models.CharField(max_length=255, blank=True)
    raw_file_sha256 = models.CharField(max_length=64, blank=True)
    record_count = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["data_source", "received_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.data_source_id}:{self.received_at:%Y-%m-%d %H:%M}"


class RawRecord(models.Model):
    class IngestStatus(models.TextChoices):
        RECEIVED = "RECEIVED", "Received"
        PARSED = "PARSED", "Parsed"
        NORMALIZED = "NORMALIZED", "Normalized"
        ERROR = "ERROR", "Error"

    data_source = models.ForeignKey(
        DataSource, on_delete=models.PROTECT, related_name="raw_records"
    )
    ingestion_batch = models.ForeignKey(
        IngestionBatch, on_delete=models.PROTECT, related_name="raw_records"
    )
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="raw_records"
    )

    received_at = models.DateTimeField(default=timezone.now)
    source_record_id = models.CharField(max_length=128, blank=True)
    source_row_number = models.PositiveIntegerField(null=True, blank=True)
    raw_payload = models.JSONField()
    raw_text = models.TextField(blank=True)
    raw_hash_sha256 = models.CharField(max_length=64, blank=True)

    ingest_status = models.CharField(
        max_length=16, choices=IngestStatus.choices, default=IngestStatus.RECEIVED
    )
    suspicious_flags = models.JSONField(default=list, blank=True)
    error_message = models.TextField(blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["organization", "data_source", "received_at"]),
            models.Index(fields=["raw_hash_sha256"]),
            models.Index(fields=["ingest_status"]),
        ]
        constraints = []

    def __str__(self) -> str:
        return f"{self.data_source_id}:{self.id}"
