import React from "react";

import StatusBadge from "./StatusBadge";

export default function DetailModal({ record, history, onClose }) {
    if (!record) {
        return null;
    }

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
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Scope</span>
                        <span>{record.scope}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Category</span>
                        <span>{record.activity_category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Activity Date</span>
                        <span>{record.activity_date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Emissions</span>
                        <span>{record.emission_amount_kgco2e} kgCO2e</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Suspicious Flags</span>
                        <span>{record.suspicious_flags?.length ? record.suspicious_flags.join(", ") : "None"}</span>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold">Review History</h3>
                    <div className="mt-3 grid gap-3">
                        {history?.review_actions?.length ? (
                            history.review_actions.map((action) => (
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
                        {history?.audit_logs?.length ? (
                            history.audit_logs.map((log) => (
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
            </div>
        </div>
    );
}
