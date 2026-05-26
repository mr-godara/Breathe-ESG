from django.db import models
from django.utils import timezone

from backend.apps.emissions.models import EmissionRecord
from backend.apps.ingestion.models import Organization


class ReviewAction(models.Model):
    class Action(models.TextChoices):
        APPROVE = "APPROVE", "Approve"
        REJECT = "REJECT", "Reject"
        FLAG = "FLAG", "Flag for review"

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="review_actions"
    )
    emission_record = models.ForeignKey(
        EmissionRecord, on_delete=models.PROTECT, related_name="review_actions"
    )
    action = models.CharField(max_length=16, choices=Action.choices)
    reviewer_name = models.CharField(max_length=128)
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["organization", "created_at"]),
            models.Index(fields=["emission_record", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.emission_record_id}:{self.action}"


class AuditLog(models.Model):
    class Event(models.TextChoices):
        INGESTED = "INGESTED", "Ingested"
        NORMALIZED = "NORMALIZED", "Normalized"
        REVIEWED = "REVIEWED", "Reviewed"
        LOCKED = "LOCKED", "Locked"

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="audit_logs"
    )
    emission_record = models.ForeignKey(
        EmissionRecord, on_delete=models.PROTECT, related_name="audit_logs"
    )
    event = models.CharField(max_length=16, choices=Event.choices)
    actor = models.CharField(max_length=128, blank=True)
    occurred_at = models.DateTimeField(default=timezone.now)
    from_status = models.CharField(max_length=16, blank=True)
    to_status = models.CharField(max_length=16, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["organization", "occurred_at"]),
            models.Index(fields=["emission_record", "occurred_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.emission_record_id}:{self.event}"
