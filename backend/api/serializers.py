from rest_framework import serializers

from backend.apps.ingestion.models import DataSource, Organization


class SapUploadSerializer(serializers.Serializer):
    organization_id = serializers.IntegerField()
    data_source_id = serializers.IntegerField()
    file = serializers.FileField()

    def validate(self, attrs):
        organization_id = attrs["organization_id"]
        data_source_id = attrs["data_source_id"]

        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist as exc:
            raise serializers.ValidationError("unknown_organization") from exc

        try:
            data_source = DataSource.objects.get(id=data_source_id, organization=organization)
        except DataSource.DoesNotExist as exc:
            raise serializers.ValidationError("unknown_data_source") from exc

        if data_source.source_type != DataSource.SourceType.SAP:
            raise serializers.ValidationError("data_source_not_sap")

        attrs["organization"] = organization
        attrs["data_source"] = data_source
        return attrs


class UtilityUploadSerializer(serializers.Serializer):
    organization_id = serializers.IntegerField()
    data_source_id = serializers.IntegerField()
    file = serializers.FileField()

    def validate(self, attrs):
        organization_id = attrs["organization_id"]
        data_source_id = attrs["data_source_id"]

        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist as exc:
            raise serializers.ValidationError("unknown_organization") from exc

        try:
            data_source = DataSource.objects.get(id=data_source_id, organization=organization)
        except DataSource.DoesNotExist as exc:
            raise serializers.ValidationError("unknown_data_source") from exc

        if data_source.source_type != DataSource.SourceType.UTILITY:
            raise serializers.ValidationError("data_source_not_utility")

        attrs["organization"] = organization
        attrs["data_source"] = data_source
        return attrs
