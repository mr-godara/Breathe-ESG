import React from "react";

export default function DataTable({ columns, rows, onRowClick }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white/80">
            <table className="w-full text-left text-sm">
                <thead className="bg-neutral-100/70 text-xs uppercase tracking-[0.2em] text-neutral-500">
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} className="px-4 py-3">
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                    {rows.map((row) => (
                        <tr
                            key={row.id}
                            className="cursor-pointer transition hover:bg-neutral-50"
                            onClick={() => onRowClick?.(row)}
                        >
                            {columns.map((column) => (
                                <td key={column.key} className="px-4 py-3">
                                    {column.render ? column.render(row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
