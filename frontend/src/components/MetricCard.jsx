import React from "react";

export default function MetricCard({ label, value, tone = "default" }) {
    const toneStyles = {
        default: "border-neutral-200 bg-white/80",
        warning: "border-amber-300 bg-amber-50",
        danger: "border-rose-300 bg-rose-50",
        success: "border-emerald-300 bg-emerald-50",
    };

    return (
        <div className={`rounded-2xl border p-5 shadow-sm ${toneStyles[tone]}`}>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
    );
}
