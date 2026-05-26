import React, { useEffect, useMemo, useState } from "react";

import DataTable from "../components/DataTable";
import DetailModal from "../components/DetailModal";
import FiltersBar from "../components/FiltersBar";
import StatusBadge from "../components/StatusBadge";
import {
    getEmissionRecordDetail,
    getReviewQueue,
    postReviewAction,
} from "../services/api";

const COLUMNS = [
    { key: "activity_date", label: "Date" },
    { key: "activity_category", label: "Category" },
    { key: "scope", label: "Scope" },
    { key: "emission_amount_kgco2e", label: "kgCO2e" },
    {
        key: "review_status",
        label: "Status",
        render: (row) => <StatusBadge status={row.review_status} />,
    },
    {
        key: "suspicious_flags",
        label: "Flags",
        render: (row) => (row.suspicious_flags?.length ? "Yes" : "No"),
    },
];

export default function ReviewQueuePage() {
    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [suspiciousOnly, setSuspiciousOnly] = useState(false);
    const [records, setRecords] = useState([]);
    const [detail, setDetail] = useState(null);
    const [organizationId] = useState("1");

    const loadQueue = async () => {
        const data = await getReviewQueue({
            status: statusFilter,
            suspiciousOnly,
            organizationId,
        });
        setRecords(data);
    };

    useEffect(() => {
        loadQueue();
    }, [statusFilter, suspiciousOnly]);

    const handleOpen = async (record) => {
        const detailResponse = await getEmissionRecordDetail({
            organizationId,
            recordId: record.id,
        });
        setDetail(detailResponse);
    };

    const handleClose = () => {
        setDetail(null);
    };

    const handleDecision = async (recordId, action) => {
        await postReviewAction({
            organizationId,
            emissionRecordId: recordId,
            action,
            reviewerName: "Analyst",
            reason: action === "REJECT" ? "Data mismatch" : "",
        });
        await loadQueue();
        if (detail?.record?.id === recordId) {
            const refreshed = await getEmissionRecordDetail({
                organizationId,
                recordId,
            });
            setDetail(refreshed);
        }
    };

    const queueData = useMemo(() => records, [records]);

    return (
        <div className="grid gap-6">
            <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6">
                <h2 className="text-xl font-semibold">Review Queue</h2>
                <p className="mt-2 text-sm text-neutral-600">
                    Work the queue from suspicious records outward. Approved records lock
                    automatically.
                </p>
            </div>

            <FiltersBar
                status={statusFilter}
                onStatusChange={setStatusFilter}
                suspiciousOnly={suspiciousOnly}
                onSuspiciousChange={setSuspiciousOnly}
            />

            <DataTable columns={COLUMNS} rows={queueData} onRowClick={handleOpen} />

            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm"
                    onClick={() => loadQueue()}
                >
                    Refresh
                </button>
            </div>

            <DetailModal
                detail={detail}
                onClose={handleClose}
                onApprove={(id) => handleDecision(id, "APPROVE")}
                onReject={(id) => handleDecision(id, "REJECT")}
            />
        </div>
    );
}
