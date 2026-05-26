import React from "react";
import EmptyState from "./EmptyState";
import { Database } from "lucide-react";

function SkeletonRow({ columns }) {
    return (
        <tr>
            {columns.map((column) => (
                <td key={column.key} className="px-4 py-3">
                    <div className="skeleton h-4 w-3/4 rounded" />
                </td>
            ))}
        </tr>
    );
}

export default function DataTable({
    columns,
    rows,
    onRowClick,
    isLoading = false,
    emptyTitle = "No records",
    emptyDescription,
    getRowClassName,
}) {
    return (
        <div
            className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white"
            style={{ boxShadow: "var(--shadow-card)" }}
        >
            <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] leading-5">
                    <thead className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-gray-50/80 backdrop-blur-sm">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500"
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <>
                                <SkeletonRow columns={columns} />
                                <SkeletonRow columns={columns} />
                                <SkeletonRow columns={columns} />
                                <SkeletonRow columns={columns} />
                                <SkeletonRow columns={columns} />
                            </>
                        ) : rows.length ? (
                            rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={`cursor-pointer transition-colors duration-100 hover:bg-gray-50 ${
                                        getRowClassName
                                            ? getRowClassName(row)
                                            : ""
                                    }`}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className="px-4 py-3 text-gray-700"
                                        >
                                            {column.render
                                                ? column.render(row)
                                                : row[column.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className="p-6" colSpan={columns.length}>
                                    <EmptyState
                                        title={emptyTitle}
                                        description={emptyDescription}
                                        icon={Database}
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
