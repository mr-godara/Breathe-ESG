import React, { useEffect, useMemo, useState } from "react";
import {
    RefreshCw,
    AlertCircle,
    ClipboardList,
} from "lucide-react";

import DataTable from "../components/DataTable";
import DetailModal from "../components/DetailModal";
import FiltersBar from "../components/FiltersBar";
import StatusBadge from "../components/StatusBadge";
import ValidationPill from "../components/ValidationPill";
import {
    getEmissionRecordDetail,
    getReviewQueue,
    postReviewAction,
} from "../services/api";

const COLUMNS = [
    { key: "activity_date", label: "Date" },
    { key: "activity_category", label: "Category" },
    { key: "scope", label: "Scope" },
    {
        key: "emission_amount_kgco2e",
        label: "kgCO₂e",
        render: (row) => (
            <span className="tabular-nums font-medium">{row.emission_amount_kgco2e}</span>
        ),
    },
    {
        key: "review_status",
        label: "Status",
        render: (row) => <StatusBadge status={row.review_status} />,
    },
    {
        key: "suspicious_flags",
        label: "Validation",
        render: (row) => (
            <ValidationPill count={row.suspicious_flags?.length || 0} />
        ),
    },
];

export default function ReviewQueuePage() {
    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [scopeFilter, setScopeFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [suspiciousOnly, setSuspiciousOnly] = useState(false);
    const [records, setRecords] = useState([]);
    const [detail, setDetail] = useState(null);
    const [organizationId] = useState("1");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadQueue = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getReviewQueue({
                status: statusFilter,
                suspiciousOnly,
                organizationId,
            });
            setRecords(data);
        } catch (err) {
            setError("Unable to load the review queue.");
        } finally {
            setIsLoading(false);
        }
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

    const queueData = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return records.filter((row) => {
            if (scopeFilter !== "ALL" && row.scope !== scopeFilter) {
                return false;
            }
            if (!query) {
                return true;
            }
            const haystack = [
                row.activity_category,
                row.scope,
                row.review_status,
                ...(row.suspicious_flags || []),
            ]
                .join(" ")
                .toLowerCase();
            return haystack.includes(query);
        });
    }, [records, searchTerm, scopeFilter]);

    return (
        <div className="grid gap-6">
            {/* ── Header card ───────────────────────────────── */}
            <div
                className="rounded-2xl border border-[var(--color-border)] bg-white p-5"
                style={{ boxShadow: "var(--shadow-card)" }}
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-gray-100 p-2">
                            <ClipboardList className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                            <h2
                                className="text-lg font-semibold text-gray-900"
                                style={{ fontFamily: "'Fraunces', serif" }}
                            >
                                Review Queue
                            </h2>
                            <p className="mt-1 text-[13px] text-gray-500">
                                Work the queue from suspicious records outward.
                                Approved records lock automatically.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isLoading && records.length > 0 && (
                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[12px] font-semibold text-gray-600 tabular-nums">
                                {queueData.length} record{queueData.length !== 1 ? "s" : ""}
                            </span>
                        )}
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                            onClick={() => loadQueue()}
                            disabled={isLoading}
                        >
                            <RefreshCw
                                className={`h-3.5 w-3.5 ${
                                    isLoading ? "animate-spin" : ""
                                }`}
                            />
                            {isLoading ? "Loading…" : "Refresh"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Filters ───────────────────────────────────── */}
            <FiltersBar
                status={statusFilter}
                onStatusChange={setStatusFilter}
                suspiciousOnly={suspiciousOnly}
                onSuspiciousChange={setSuspiciousOnly}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                scope={scopeFilter}
                onScopeChange={setScopeFilter}
            />

            {/* ── Error ─────────────────────────────────────── */}
            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-rejected-border)] bg-[var(--color-rejected-bg)] p-4 animate-fade-in">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-[var(--color-rejected)]" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--color-rejected-text)]">
                            {error}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => loadQueue()}
                        className="rounded-lg border border-rose-300 bg-white px-3 py-1 text-[12px] font-medium text-rose-700 transition-colors hover:bg-rose-50"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* ── Table ─────────────────────────────────────── */}
            <DataTable
                columns={COLUMNS}
                rows={queueData}
                onRowClick={handleOpen}
                isLoading={isLoading}
                emptyTitle="No matching records"
                emptyDescription="Adjust filters or upload new data sources."
                getRowClassName={(row) =>
                    row.suspicious_flags?.length
                        ? "bg-orange-50/50 border-l-2 border-l-orange-400"
                        : ""
                }
            />

            {/* ── Detail modal ──────────────────────────────── */}
            <DetailModal
                detail={detail}
                onClose={handleClose}
                onApprove={(id) => handleDecision(id, "APPROVE")}
                onReject={(id) => handleDecision(id, "REJECT")}
            />
        </div>
    );
}
