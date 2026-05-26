import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ValidationPill({ count }) {
    if (!count) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-approved-border)] bg-[var(--color-approved-bg)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-approved-text)]">
                <CheckCircle2 className="h-3 w-3" />
                Clean
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-suspicious-border)] bg-[var(--color-suspicious-bg)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-suspicious-text)]">
            <AlertTriangle className="h-3 w-3" />
            {count} Flag{count === 1 ? "" : "s"}
        </span>
    );
}
