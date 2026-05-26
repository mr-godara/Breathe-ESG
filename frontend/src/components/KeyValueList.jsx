import React from "react";

export default function KeyValueList({ items }) {
    return (
        <div className="grid gap-0 text-sm">
            {items.map((item, index) => (
                <div
                    key={item.label}
                    className={`flex items-start justify-between gap-6 py-2.5 ${
                        index < items.length - 1
                            ? "border-b border-gray-100"
                            : ""
                    }`}
                >
                    <span className="text-gray-500 whitespace-nowrap">{item.label}</span>
                    <span className="text-right font-medium text-gray-800">
                        {item.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
