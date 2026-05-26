import React from "react";

export default function FiltersBar({
    status,
    onStatusChange,
    suspiciousOnly,
    onSuspiciousChange,
    searchTerm,
    onSearchChange,
    scope,
    onScopeChange,
}) {
    return (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white/80 p-4">
            <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Status</span>
                <select
                    value={status}
                    onChange={(event) => onStatusChange(event.target.value)}
                    className="mt-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
                >
                    <option value="ALL">All</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>
            <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Scope</span>
                <select
                    value={scope}
                    onChange={(event) => onScopeChange(event.target.value)}
                    className="mt-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
                >
                    <option value="ALL">All</option>
                    <option value="S1">Scope 1</option>
                    <option value="S2">Scope 2</option>
                    <option value="S3">Scope 3</option>
                </select>
            </div>
            <div className="flex flex-1 flex-col min-w-[200px]">
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Search</span>
                <input
                    value={searchTerm}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Category, source, flags"
                    className="mt-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
                />
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-600">
                <input
                    type="checkbox"
                    checked={suspiciousOnly}
                    onChange={(event) => onSuspiciousChange(event.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300"
                />
                Suspicious only
            </label>
        </div>
    );
}
