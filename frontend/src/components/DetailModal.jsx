import React from "react";

import KeyValueList from "./KeyValueList";
import StatusBadge from "./StatusBadge";

export default function DetailModal({ detail, onClose, onApprove, onReject }) {
    if (!detail?.record) {
        return null;
    }

    const { record, review_actions: reviewActions, audit_logs: auditLogs } = detail;
    const sourceMeta = record.data_source || {};
    const batchMeta = record.ingestion_batch || {};
    const rawRecord = record.raw_record || {};

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                            Emission Record
                        </p>
                        <h2 className="text-2xl font-semibold">Record #{record.id}</h2>
                    </div>
                    <button
                        type="button"
                        className="rounded-full border border-neutral-300 px-3 py-1 text-sm"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>

                <div className="mt-6 grid gap-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Status</span>
                        <StatusBadge status={record.review_status} />
                    </div>
                    <KeyValueList
                        items={[
                            { label: "Scope", value: record.scope },
                            { label: "Category", value: record.activity_category },
                            { label: "Activity Date", value: record.activity_date },
                            {
                                label: "Emissions",
                                value: `${record.emission_amount_kgco2e} kgCO2e`,
                            },
                            {
                                label: "Suspicious Flags",
                                value: record.suspicious_flags?.length
                                    ? record.suspicious_flags.join(", ")
                                    : "None",
                            },
                        ]}
                    />
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                        <h3 className="text-lg font-semibold">Source Metadata</h3>
                        <div className="mt-3">
                            <KeyValueList
                                items={[
                                    { label: "Source", value: sourceMeta.name || "-" },
                                    { label: "Source Type", value: sourceMeta.source_type || "-" },
                                    { label: "Batch", value: batchMeta.id || "-" },
                                    { label: "File", value: batchMeta.raw_file_name || "-" },
                                    { label: "Received", value: batchMeta.received_at || "-" },
                                ]}
                            />
                        </div>
                    </div>
                    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                        <h3 className="text-lg font-semibold">Normalized Emissions</h3>
                        <div className="mt-3">
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
                                    { label: "Location", value: record.location || "-" },
                                    { label: "Supplier", value: record.supplier || "-" },
                                    { label: "Travel Mode", value: record.travel_mode || "-" },
                                    { label: "Class", value: record.class_of_travel || "-" },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
                    <h3 className="text-lg font-semibold">Raw Import Payload</h3>
                    <div className="mt-3 grid gap-2 text-xs text-neutral-600">
                        <div>Row: {rawRecord.source_row_number || "-"}</div>
                        <div>Source Record ID: {rawRecord.source_record_id || "-"}</div>
                        <div>Status: {rawRecord.ingest_status || "-"}</div>
                        <div>
                            Raw Flags: {rawRecord.suspicious_flags?.length
                                ? rawRecord.suspicious_flags.join(", ")
                                : "None"}
                        </div>
                        {rawRecord.error_message ? (
                            <div>Error: {rawRecord.error_message}</div>
                        ) : null}
                    </div>
                    <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-neutral-900 p-4 text-xs text-neutral-100">
                        {JSON.stringify(rawRecord.raw_payload || {}, null, 2)}
                    </pre>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold">Review History</h3>
                    <div className="mt-3 grid gap-3">
                        {reviewActions?.length ? (
                            reviewActions.map((action) => (
                                <div key={`review-${action.id}`} className="rounded-xl border border-neutral-200 p-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{action.action}</span>
                                        <span className="text-neutral-500">{action.created_at}</span>
                                    </div>
                                    <p className="mt-2 text-neutral-600">{action.reviewer_name}</p>
                                    {action.reason ? (
                                        <p className="mt-1 text-neutral-500">Reason: {action.reason}</p>
                                    ) : null}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-neutral-500">No review actions yet.</p>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold">Audit Log</h3>
                    <div className="mt-3 grid gap-3">
                        {auditLogs?.length ? (
                            auditLogs.map((log) => (
                                <div key={`audit-${log.id}`} className="rounded-xl border border-neutral-200 p-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{log.event}</span>
                                        <span className="text-neutral-500">{log.occurred_at}</span>
                                    </div>
                                    <p className="mt-2 text-neutral-500">{log.actor || "System"}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-neutral-500">No audit events yet.</p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        type="button"
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white"
                        onClick={() => onApprove(record.id)}
                        disabled={record.is_locked}
                    >
                        Approve
                    </button>
                    <button
                        type="button"
                        className="rounded-full bg-rose-600 px-4 py-2 text-sm text-white"
                        onClick={() => onReject(record.id)}
                        disabled={record.is_locked}
                    >
                        Reject
                    </button>
                    {record.is_locked ? (
                        <span className="text-xs text-neutral-500">
                            Record is locked after approval.
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
