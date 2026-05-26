from __future__ import annotations

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from backend.apps.emissions.models import EmissionRecord
from backend.apps.ingestion.models import Organization
from backend.apps.reviews.models import AuditLog, ReviewAction
from backend.api.review_serializers import (
    AuditLogListSerializer,
    EmissionRecordDetailSerializer,
    ReviewActionListSerializer,
    ReviewActionSerializer,
    ReviewQueueSerializer,
)
from backend.services.ingestion.review_workflow import apply_review_action


class ReviewQueueView(APIView):
    def get(self, request, *args, **kwargs):
        organization_id = request.query_params.get("organization_id")
        status_filter = request.query_params.get("status", "PENDING")
        suspicious_only = request.query_params.get("suspicious_only") == "true"

        if not organization_id:
            return Response(
                {"error": "organization_id_required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            return Response(
                {"error": "unknown_organization"},
                status=status.HTTP_404_NOT_FOUND,
            )

        records = EmissionRecord.objects.filter(organization=organization)
        if status_filter and status_filter != "ALL":
            records = records.filter(review_status=status_filter)

        if suspicious_only:
            records = records.exclude(suspicious_flags=[])

        records = records.order_by("activity_date")
        serializer = ReviewQueueSerializer(records, many=True)
        return Response(serializer.data)


class ReviewActionView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = ReviewActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = apply_review_action(
            organization=serializer.validated_data["organization"],
            emission_record=serializer.validated_data["emission_record"],
            action=serializer.validated_data["action"],
            reviewer_name=serializer.validated_data["reviewer_name"],
            reason=serializer.validated_data["reason"],
        )

        return Response(
            {
                "review_action_id": result.review_action_id,
                "audit_log_id": result.audit_log_id,
                "locked_audit_log_id": result.locked_audit_log_id,
            },
            status=status.HTTP_200_OK,
        )


class ReviewHistoryView(APIView):
    def get(self, request, record_id: int, *args, **kwargs):
        organization_id = request.query_params.get("organization_id")
        if not organization_id:
            return Response(
                {"error": "organization_id_required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            return Response(
                {"error": "unknown_organization"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            record = EmissionRecord.objects.get(
                id=record_id, organization=organization
            )
        except EmissionRecord.DoesNotExist:
            return Response(
                {"error": "unknown_emission_record"},
                status=status.HTTP_404_NOT_FOUND,
            )

        review_actions = ReviewAction.objects.filter(
            emission_record=record, organization=organization
        ).order_by("created_at")
        audit_logs = AuditLog.objects.filter(
            emission_record=record, organization=organization
        ).order_by("occurred_at")

        return Response(
            {
                "review_actions": ReviewActionListSerializer(
                    review_actions, many=True
                ).data,
                "audit_logs": AuditLogListSerializer(audit_logs, many=True).data,
            }
        )


class EmissionRecordDetailView(APIView):
    def get(self, request, record_id: int, *args, **kwargs):
        organization_id = request.query_params.get("organization_id")
        if not organization_id:
            return Response(
                {"error": "organization_id_required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            return Response(
                {"error": "unknown_organization"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            record = EmissionRecord.objects.select_related(
                "data_source",
                "raw_record",
                "raw_record__ingestion_batch",
            ).get(id=record_id, organization=organization)
        except EmissionRecord.DoesNotExist:
            return Response(
                {"error": "unknown_emission_record"},
                status=status.HTTP_404_NOT_FOUND,
            )

        review_actions = ReviewAction.objects.filter(
            emission_record=record, organization=organization
        ).order_by("created_at")
        audit_logs = AuditLog.objects.filter(
            emission_record=record, organization=organization
        ).order_by("occurred_at")

        return Response(
            {
                "record": EmissionRecordDetailSerializer(record).data,
                "review_actions": ReviewActionListSerializer(
                    review_actions, many=True
                ).data,
                "audit_logs": AuditLogListSerializer(audit_logs, many=True).data,
            }
        )
