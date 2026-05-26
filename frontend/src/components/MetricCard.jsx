import React from "react";
import { TrendingUp } from "lucide-react";

export default function MetricCard({ label, value, tone = "default", icon: Icon }) {
    const toneStyles = {
        default: "border-[var(--color-border)] bg-white",
        warning: "border-[var(--color-pending-border)] bg-[var(--color-pending-bg)]",
        danger: "border-[var(--color-rejected-border)] bg-[var(--color-rejected-bg)]",
        success: "border-[var(--color-approved-border)] bg-[var(--color-approved-bg)]",
    };

    const iconColor = {
        default: "text-gray-400",
        warning: "text-amber-500",
        danger: "text-rose-500",
        success: "text-emerald-500",
    };

    return (
        <div
            className={`group rounded-2xl border p-5 transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] ${toneStyles[tone]}`}
            style={{ boxShadow: "var(--shadow-card)" }}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                        {label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900">
                        {value}
                    </p>
                </div>
                {Icon && (
                    <div className={`rounded-lg bg-gray-100/60 p-2 ${iconColor[tone]}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                )}
            </div>
        </div>
    );
}
