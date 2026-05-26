import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
    timeout: 20000,
});

export async function uploadSapCsv({ organizationId, dataSourceId, file }) {
    const formData = new FormData();
    formData.append("organization_id", organizationId);
    formData.append("data_source_id", dataSourceId);
    formData.append("file", file);

    const response = await apiClient.post("/ingestion/sap/upload/", formData);
    return response.data;
}

export async function uploadUtilityCsv({ organizationId, dataSourceId, file }) {
    const formData = new FormData();
    formData.append("organization_id", organizationId);
    formData.append("data_source_id", dataSourceId);
    formData.append("file", file);

    const response = await apiClient.post("/ingestion/utility/upload/", formData);
    return response.data;
}

export async function getReviewQueue({ organizationId = "1", status = "PENDING", suspiciousOnly = false }) {
    const response = await apiClient.get("/reviews/queue/", {
        params: {
            organization_id: organizationId,
            status,
            suspicious_only: suspiciousOnly ? "true" : "false",
        },
    });
    return response.data;
}

export async function postReviewAction({
    organizationId,
    emissionRecordId,
    action,
    reviewerName,
    reason,
}) {
    const response = await apiClient.post("/reviews/action/", {
        organization_id: organizationId,
        emission_record_id: emissionRecordId,
        action,
        reviewer_name: reviewerName,
        reason,
    });
    return response.data;
}

export async function getReviewHistory({ organizationId, recordId }) {
    const response = await apiClient.get(`/reviews/history/${recordId}/`, {
        params: { organization_id: organizationId },
    });
    return response.data;
}

export async function getEmissionRecordDetail({ organizationId, recordId }) {
    const response = await apiClient.get(`/records/detail/${recordId}/`, {
        params: { organization_id: organizationId },
    });
    return response.data;
}
