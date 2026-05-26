from django.db import models
from django.db.models import Q
from django.utils import timezone

from backend.apps.ingestion.models import DataSource, Organization, RawRecord


class EmissionRecord(models.Model):
    class Scope(models.TextChoices):
        SCOPE_1 = "S1", "Scope 1"
        SCOPE_2 = "S2", "Scope 2"
        SCOPE_3 = "S3", "Scope 3"

    class ReviewStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    class ActivityCategory(models.TextChoices):
        FUEL_COMBUSTION = "FUEL_COMBUSTION", "Fuel combustion"
        ELECTRICITY = "ELECTRICITY", "Purchased electricity"
        BUSINESS_TRAVEL = "BUSINESS_TRAVEL", "Business travel"
        PROCUREMENT = "PROCUREMENT", "Purchased goods"

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="emission_records"
    )
    data_source = models.ForeignKey(
        DataSource, on_delete=models.PROTECT, related_name="emission_records"
    )
    raw_record = models.ForeignKey(
        RawRecord, on_delete=models.PROTECT, related_name="emission_records"
    )

    activity_category = models.CharField(
        max_length=32, choices=ActivityCategory.choices
    )
    scope = models.CharField(max_length=2, choices=Scope.choices)
    activity_date = models.DateField()
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)

    quantity = models.DecimalField(max_digits=18, decimal_places=6)
    quantity_unit = models.CharField(max_length=16)
    normalized_quantity = models.DecimalField(max_digits=18, decimal_places=6)
    normalized_unit = models.CharField(max_length=16)
    emission_factor = models.DecimalField(max_digits=18, decimal_places=6)
    emission_factor_unit = models.CharField(max_length=32)
    emission_amount_kgco2e = models.DecimalField(max_digits=18, decimal_places=6)

    location = models.CharField(max_length=128, blank=True)
    supplier = models.CharField(max_length=255, blank=True)
    travel_mode = models.CharField(max_length=64, blank=True)
    class_of_travel = models.CharField(max_length=64, blank=True)

    review_status = models.CharField(
        max_length=16, choices=ReviewStatus.choices, default=ReviewStatus.PENDING
    )
    suspicious_flags = models.JSONField(default=list, blank=True)
    is_locked = models.BooleanField(default=False)
    locked_at = models.DateTimeField(null=True, blank=True)
    locked_snapshot = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["organization", "review_status"]),
            models.Index(fields=["organization", "scope"]),
            models.Index(fields=["data_source", "activity_date"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(quantity__gte=0), name="emission_quantity_non_negative"
            ),
            models.CheckConstraint(
                check=Q(normalized_quantity__gte=0),
                name="emission_normalized_quantity_non_negative",
            ),
            models.CheckConstraint(
                check=Q(emission_amount_kgco2e__gte=0),
                name="emission_amount_non_negative",
            ),
            models.CheckConstraint(
                check=Q(period_end__isnull=True)
                | Q(period_start__isnull=True)
                | Q(period_end__gte=models.F("period_start")),
                name="emission_period_valid",
            ),
        ]

    def lock_for_audit(self) -> None:
        if not self.is_locked:
            self.is_locked = True
            self.locked_at = timezone.now()
            self.locked_snapshot = {
                "activity_category": self.activity_category,
                "scope": self.scope,
                "activity_date": self.activity_date.isoformat(),
                "period_start": self.period_start.isoformat()
                if self.period_start
                else None,
                "period_end": self.period_end.isoformat() if self.period_end else None,
                "quantity": str(self.quantity),
                "quantity_unit": self.quantity_unit,
                "normalized_quantity": str(self.normalized_quantity),
                "normalized_unit": self.normalized_unit,
                "emission_factor": str(self.emission_factor),
                "emission_factor_unit": self.emission_factor_unit,
                "emission_amount_kgco2e": str(self.emission_amount_kgco2e),
                "location": self.location,
                "supplier": self.supplier,
                "travel_mode": self.travel_mode,
                "class_of_travel": self.class_of_travel,
            }

    def __str__(self) -> str:
        return f"{self.organization.slug}:{self.id}"
