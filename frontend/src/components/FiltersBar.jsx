import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

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
        <div
            className="flex flex-wrap items-end gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-4"
            style={{ boxShadow: "var(--shadow-card)" }}
        >
            <div className="flex items-center gap-2 text-gray-400 mr-1">
                <SlidersHorizontal className="h-4 w-4" />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                    Status
                </span>
                <select
                    value={status}
                    onChange={(event) => onStatusChange(event.target.value)}
                    className="h-9 rounded-lg border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10"
                >
                    <option value="ALL">All</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* Scope */}
            <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                    Scope
                </span>
                <select
                    value={scope}
                    onChange={(event) => onScopeChange(event.target.value)}
                    className="h-9 rounded-lg border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10"
                >
                    <option value="ALL">All</option>
                    <option value="S1">Scope 1</option>
                    <option value="S2">Scope 2</option>
                    <option value="S3">Scope 3</option>
                </select>
            </div>

            {/* Search */}
            <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                    Search
                </span>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    <input
                        value={searchTerm}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Category, source, flags…"
                        className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10"
                    />
                </div>
            </div>

            {/* Suspicious toggle */}
            <button
                type="button"
                onClick={() => onSuspiciousChange(!suspiciousOnly)}
                className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
                    suspiciousOnly
                        ? "border-orange-300 bg-orange-50 text-orange-700"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
            >
                <span
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        suspiciousOnly ? "bg-orange-500" : "bg-gray-300"
                    }`}
                >
                    <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                            suspiciousOnly ? "translate-x-4" : "translate-x-1"
                        }`}
                    />
                </span>
                Suspicious only
            </button>
        </div>
    );
}
