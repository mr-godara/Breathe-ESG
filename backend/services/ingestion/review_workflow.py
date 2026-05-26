from __future__ import annotations

from dataclasses import dataclass

from django.db import transaction

from backend.apps.emissions.models import EmissionRecord
from backend.apps.ingestion.models import Organization
from backend.apps.reviews.models import AuditLog, ReviewAction


@dataclass
class ReviewResult:
    review_action_id: int
    audit_log_id: int
    locked_audit_log_id: int | None


def apply_review_action(
    *,
    organization: Organization,
    emission_record: EmissionRecord,
    action: str,
    reviewer_name: str,
    reason: str,
) -> ReviewResult:
    if emission_record.organization_id != organization.id:
        raise ValueError("record_not_in_organization")
    if emission_record.is_locked:
        raise ValueError("record_locked")

    from_status = emission_record.review_status
    locked_audit_log_id = None

    with transaction.atomic():
        if action == ReviewAction.Action.APPROVE:
            emission_record.review_status = EmissionRecord.ReviewStatus.APPROVED
            emission_record.lock_for_audit()
            emission_record.save(
                update_fields=[
                    "review_status",
                    "is_locked",
                    "locked_at",
                    "locked_snapshot",
                    "updated_at",
                ]
            )
        elif action == ReviewAction.Action.REJECT:
            emission_record.review_status = EmissionRecord.ReviewStatus.REJECTED
            emission_record.save(update_fields=["review_status", "updated_at"])
        else:
            raise ValueError("unsupported_action")

        review_action = ReviewAction.objects.create(
            organization=organization,
            emission_record=emission_record,
            action=action,
            reviewer_name=reviewer_name,
            reason=reason,
        )

        audit_log = AuditLog.objects.create(
            organization=organization,
            emission_record=emission_record,
            event=AuditLog.Event.REVIEWED,
            actor=reviewer_name,
            from_status=from_status,
            to_status=emission_record.review_status,
            metadata={"reason": reason},
        )

        if action == ReviewAction.Action.APPROVE:
            locked_log = AuditLog.objects.create(
                organization=organization,
                emission_record=emission_record,
                event=AuditLog.Event.LOCKED,
                actor=reviewer_name,
                from_status=emission_record.review_status,
                to_status=emission_record.review_status,
                metadata={"locked": True},
            )
            locked_audit_log_id = locked_log.id

    return ReviewResult(
        review_action_id=review_action.id,
        audit_log_id=audit_log.id,
        locked_audit_log_id=locked_audit_log_id,
    )
