import React from "react";
import { Inbox } from "lucide-react";

export default function EmptyState({
    title,
    description,
    icon: Icon = Inbox,
    action,
    onAction,
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-center">
            <div className="rounded-xl bg-gray-100 p-3">
                <Icon className="h-6 w-6 text-gray-400" />
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-700">{title}</p>
            {description && (
                <p className="mt-1.5 max-w-sm text-[13px] leading-5 text-gray-500">
                    {description}
                </p>
            )}
            {action && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                    {action}
                </button>
            )}
        </div>
    );
}
