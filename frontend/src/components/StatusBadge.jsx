import React from "react";

const STATUS_STYLES = {
    PENDING: "bg-amber-100 text-amber-900 border-amber-300",
    APPROVED: "bg-emerald-100 text-emerald-900 border-emerald-300",
    REJECTED: "bg-rose-100 text-rose-900 border-rose-300",
};

export default function StatusBadge({ status }) {
    const style = STATUS_STYLES[status] || "bg-neutral-100 text-neutral-800 border-neutral-200";
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>
            {status}
        </span>
    );
}
