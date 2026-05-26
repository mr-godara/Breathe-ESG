import React, { useState } from "react";
import {
    X,
    CheckCircle2,
    XCircle,
    Lock,
    FileText,
    Database,
    History,
    Shield,
} from "lucide-react";

import KeyValueList from "./KeyValueList";
import StatusBadge from "./StatusBadge";

const TABS = [
    { key: "overview", label: "Overview", icon: FileText },
    { key: "source", label: "Source & Normalization", icon: Database },
    { key: "raw", label: "Raw Payload", icon: FileText },
    { key: "audit", label: "Audit Trail", icon: History },
];

export default function DetailModal({ detail, onClose, onApprove, onReject }) {
    const [activeTab, setActiveTab] = useState("overview");

    if (!detail?.record) {
        return null;
    }

    const {
        record,
        review_actions: reviewActions,
        audit_logs: auditLogs,
    } = detail;
    const sourceMeta = record.data_source || {};
    const batchMeta = record.ingestion_batch || {};
    const rawRecord = record.raw_record || {};

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gray-200 bg-white animate-slide-up"
                style={{ boxShadow: "var(--shadow-modal)" }}
            >
                {/* ── Header ────────────────────────────────── */}
                <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur-sm px-6 py-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                                Emission Record
                            </p>
                            <h2
                                className="mt-1 text-xl font-semibold text-gray-900"
                                style={{ fontFamily: "'Fraunces', serif" }}
                            >
                                Record #{record.id}
                            </h2>
                        </div>
                        <button
                            type="button"
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="mt-4 flex gap-1">
                        {TABS.map((tab) => {
                            const TabIcon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                                        isActive
                                            ? "bg-gray-900 text-white"
                                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                    }`}
                                >
                                    <TabIcon className="h-3 w-3" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Tab content ────────────────────────────── */}
                <div className="p-6">
                    {/* Overview */}
                    {activeTab === "overview" && (
                        <div className="animate-fade-in space-y-4">
                            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-500">
                                        Review Status
                                    </span>
                                    <StatusBadge status={record.review_status} />
                                </div>
                                <KeyValueList
                                    items={[
                                        { label: "Scope", value: record.scope },
                                        {
                                            label: "Category",
                                            value: record.activity_category,
                                        },
                                        {
                                            label: "Activity Date",
                                            value: record.activity_date,
                                        },
                                        {
                                            label: "Emissions",
                                            value: `${record.emission_amount_kgco2e} kgCO₂e`,
                                        },
                                        {
                                            label: "Suspicious Flags",
                                            value: record.suspicious_flags
                                                ?.length
                                                ? record.suspicious_flags.join(
                                                      ", "
                                                  )
                                                : "None",
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                    )}

                    {/* Source & Normalization */}
                    {activeTab === "source" && (
                        <div className="animate-fade-in grid gap-4 lg:grid-cols-2">
                            <div className="rounded-xl border border-gray-200 bg-white p-4">
                                <h3 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-gray-500 mb-3">
                                    Source Metadata
                                </h3>
                                <KeyValueList
                                    items={[
                                        {
                                            label: "Source",
                                            value: sourceMeta.name || "–",
                                        },
                                        {
                                            label: "Source Type",
                                            value:
                                                sourceMeta.source_type || "–",
                                        },
                                        {
                                            label: "Batch",
                                            value: batchMeta.id || "–",
                                        },
                                        {
                                            label: "File",
                                            value:
                                                batchMeta.raw_file_name || "–",
                                        },
                                        {
                                            label: "Received",
                                            value:
                                                batchMeta.received_at || "–",
                                        },
                                    ]}
                                />
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-white p-4">
                                <h3 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-gray-500 mb-3">
                                    Normalized Emissions
                                </h3>
                                <KeyValueList
                                    items={[
                                        {
                                            label: "Quantity",
                                            value: `${record.quantity} ${record.quantity_unit}`,
                                        },
                                        {
                                            label: "Normalized",
                                            value: `${record.normalized_quantity} ${record.normalized_unit}`,
                                        },
                                        {
                                            label: "Emission Factor",
                                            value: `${record.emission_factor} ${record.emission_factor_unit}`,
                                        },
                                        {
                                            label: "Location",
                                            value: record.location || "–",
                                        },
                                        {
                                            label: "Supplier",
                                            value: record.supplier || "–",
                                        },
                                        {
                                            label: "Travel Mode",
                                            value: record.travel_mode || "–",
                                        },
                                        {
                                            label: "Class",
                                            value:
                                                record.class_of_travel || "–",
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                    )}

                    {/* Raw Payload */}
                    {activeTab === "raw" && (
                        <div className="animate-fade-in space-y-4">
                            <div className="rounded-xl border border-gray-200 bg-white p-4">
                                <h3 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-gray-500 mb-3">
                                    Import Metadata
                                </h3>
                                <div className="grid gap-2 text-[13px] text-gray-600">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Row</span>
                                        <span className="font-medium">{rawRecord.source_row_number || "–"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Source Record ID</span>
                                        <span className="font-medium font-mono text-[12px]">{rawRecord.source_record_id || "–"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status</span>
                                        <span className="font-medium">{rawRecord.ingest_status || "–"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Raw Flags</span>
                                        <span className="font-medium">
                                            {rawRecord.suspicious_flags?.length
                                                ? rawRecord.suspicious_flags.join(", ")
                                                : "None"}
                                        </span>
                                    </div>
                                    {rawRecord.error_message && (
                                        <div className="mt-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800">
                                            {rawRecord.error_message}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-gray-950 p-4 overflow-auto max-h-64">
                                <pre className="text-[12px] leading-5 text-gray-300 font-mono">
                                    {JSON.stringify(
                                        rawRecord.raw_payload || {},
                                        null,
                                        2
                                    )}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Audit Trail */}
                    {activeTab === "audit" && (
                        <div className="animate-fade-in space-y-6">
                            {/* Review History */}
                            <div>
                                <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.05em] text-gray-500 mb-3">
                                    <Shield className="h-3.5 w-3.5" />
                                    Review History
                                </h3>
                                <div className="space-y-2">
                                    {reviewActions?.length ? (
                                        reviewActions.map((action) => (
                                            <div
                                                key={`review-${action.id}`}
                                                className="rounded-xl border border-gray-200 bg-white px-4 py-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        {action.action}
                                                    </span>
                                                    <span className="text-[12px] text-gray-400 tabular-nums">
                                                        {action.created_at}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-[13px] text-gray-500">
                                                    {action.reviewer_name}
                                                </p>
                                                {action.reason && (
                                                    <p className="mt-1 text-[12px] text-gray-400">
                                                        Reason: {action.reason}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[13px] text-gray-400">
                                            No review actions yet.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Audit Log */}
                            <div>
                                <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.05em] text-gray-500 mb-3">
                                    <History className="h-3.5 w-3.5" />
                                    Audit Events
                                </h3>
                                <div className="space-y-2">
                                    {auditLogs?.length ? (
                                        auditLogs.map((log) => (
                                            <div
                                                key={`audit-${log.id}`}
                                                className="rounded-xl border border-gray-200 bg-white px-4 py-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        {log.event}
                                                    </span>
                                                    <span className="text-[12px] text-gray-400 tabular-nums">
                                                        {log.occurred_at}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-[13px] text-gray-500">
                                                    {log.actor || "System"}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[13px] text-gray-400">
                                            No audit events yet.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Actions footer ──────────────────────────── */}
                <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur-sm px-6 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => onApprove(record.id)}
                            disabled={record.is_locked}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => onReject(record.id)}
                            disabled={record.is_locked}
                        >
                            <XCircle className="h-4 w-4" />
                            Reject
                        </button>
                        {record.is_locked && (
                            <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-400">
                                <Lock className="h-3.5 w-3.5" />
                                Record is locked after approval
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
