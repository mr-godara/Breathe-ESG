import React from "react";

export default function EmptyState({ title, description }) {
    return (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 p-6 text-center">
            <p className="text-sm font-semibold text-neutral-700">{title}</p>
            {description ? (
                <p className="mt-2 text-sm text-neutral-500">{description}</p>
            ) : null}
        </div>
    );
}
