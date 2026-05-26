import React from "react";

export default function ValidationPill({ count }) {
    if (!count) {
        return (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                Clean
            </span>
        );
    }

    return (
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
            {count} Flag{count === 1 ? "" : "s"}
        </span>
    );
}
