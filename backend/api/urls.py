from django.urls import path

from backend.api.sap_ingestion import SapCsvUploadView
from backend.api.utility_ingestion import UtilityCsvUploadView
from backend.api.review_workflow import (
    EmissionRecordDetailView,
    ReviewActionView,
    ReviewHistoryView,
    ReviewQueueView,
)


urlpatterns = [
    path("ingestion/sap/upload/", SapCsvUploadView.as_view(), name="sap-upload"),
    path("ingestion/utility/upload/", UtilityCsvUploadView.as_view(), name="utility-upload"),
    path("reviews/queue/", ReviewQueueView.as_view(), name="review-queue"),
    path("reviews/action/", ReviewActionView.as_view(), name="review-action"),
    path("reviews/history/<int:record_id>/", ReviewHistoryView.as_view(), name="review-history"),
    path("records/detail/<int:record_id>/", EmissionRecordDetailView.as_view(), name="record-detail"),
]
