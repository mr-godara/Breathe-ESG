import React from "react";

export default function KeyValueList({ items }) {
    return (
        <div className="grid gap-3 text-sm">
            {items.map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-6">
                    <span className="text-neutral-500">{item.label}</span>
                    <span className="text-right text-neutral-800">{item.value}</span>
                </div>
            ))}
        </div>
    );
}
