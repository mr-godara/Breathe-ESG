import React from "react";

const STATUS_STYLES = {
    PENDING: "bg-[var(--color-pending-bg)] text-[var(--color-pending-text)] border-[var(--color-pending-border)]",
    APPROVED: "bg-[var(--color-approved-bg)] text-[var(--color-approved-text)] border-[var(--color-approved-border)]",
    REJECTED: "bg-[var(--color-rejected-bg)] text-[var(--color-rejected-text)] border-[var(--color-rejected-border)]",
    SUSPICIOUS: "bg-[var(--color-suspicious-bg)] text-[var(--color-suspicious-text)] border-[var(--color-suspicious-border)]",
};

const STATUS_DOT = {
    PENDING: "bg-[var(--color-pending)]",
    APPROVED: "bg-[var(--color-approved)]",
    REJECTED: "bg-[var(--color-rejected)]",
    SUSPICIOUS: "bg-[var(--color-suspicious)]",
};

export default function StatusBadge({ status }) {
    const style =
        STATUS_STYLES[status] || "bg-gray-100 text-gray-700 border-gray-200";
    const dotColor = STATUS_DOT[status] || "bg-gray-400";
    const isPending = status === "PENDING";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-5 ${style}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${dotColor} ${
                    isPending ? "animate-pulse-dot" : ""
                }`}
            />
            {status}
        </span>
    );
}
