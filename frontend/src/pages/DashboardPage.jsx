import React, { useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    XCircle,
} from "lucide-react";

import MetricCard from "../components/MetricCard";
import StatusBadge from "../components/StatusBadge";
import { getReviewQueue } from "../services/api";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        total: 0,
        suspicious: 0,
        approved: 0,
        rejected: 0,
    });
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let active = true;
        async function loadStats() {
            setIsLoading(true);
            try {
                const records = await getReviewQueue({ status: "ALL" });
                if (!active) return;
                setRecords(records);
                const suspicious = records.filter(
                    (row) => row.suspicious_flags?.length
                ).length;
                const approved = records.filter(
                    (row) => row.review_status === "APPROVED"
                ).length;
                const rejected = records.filter(
                    (row) => row.review_status === "REJECTED"
                ).length;
                setStats({
                    total: records.length,
                    suspicious,
                    approved,
                    rejected,
                });
            } catch (error) {
                if (!active) return;
                setRecords([]);
                setStats({
                    total: 0,
                    suspicious: 0,
                    approved: 0,
                    rejected: 0,
                });
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }
        loadStats();
        return () => {
            active = false;
        };
    }, []);

    const suspiciousRecords = useMemo(
        () =>
            records
                .filter((row) => row.suspicious_flags?.length)
                .slice(0, 6),
        [records]
    );

    const recentUploads = useMemo(() => {
        return [...records]
            .filter((row) => row.activity_date)
            .sort((a, b) => b.activity_date.localeCompare(a.activity_date))
            .slice(0, 5);
    }, [records]);

    const statusSummary = useMemo(() => {
        const pending = records.filter(
            (row) => row.review_status === "PENDING"
        ).length;
        const approved = records.filter(
            (row) => row.review_status === "APPROVED"
        ).length;
        const rejected = records.filter(
            (row) => row.review_status === "REJECTED"
        ).length;
        return { pending, approved, rejected };
    }, [records]);

    const total = statusSummary.pending + statusSummary.approved + statusSummary.rejected || 1;

    return (
        <div className="grid gap-6">
            {/* ── Metrics ───────────────────────────────────── */}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {isLoading ? (
                    <>
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border border-gray-200 bg-white p-5"
                                style={{ boxShadow: "var(--shadow-card)" }}
                            >
                                <div className="skeleton h-3 w-20 mb-3" />
                                <div className="skeleton h-8 w-16" />
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <MetricCard
                            label="Total Records"
                            value={stats.total}
                            icon={Activity}
                        />
                        <MetricCard
                            label="Suspicious"
                            value={stats.suspicious}
                            tone="warning"
                            icon={AlertTriangle}
                        />
                        <MetricCard
                            label="Approved"
                            value={stats.approved}
                            tone="success"
                            icon={CheckCircle2}
                        />
                        <MetricCard
                            label="Rejected"
                            value={stats.rejected}
                            tone="danger"
                            icon={XCircle}
                        />
                    </>
                )}
            </section>

            {/* ── Suspicious + Sidebar ──────────────────────── */}
            <section className="grid gap-6 lg:grid-cols-3">
                {/* Suspicious Records Table */}
                <div
                    className="rounded-2xl border border-[var(--color-border)] bg-white p-5 lg:col-span-2"
                    style={{ boxShadow: "var(--shadow-card)" }}
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: "'Fraunces', serif" }}>
                                Suspicious Records
                            </h2>
                            <p className="mt-1 text-[13px] text-gray-500">
                                High-risk items needing analyst attention.
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                            <AlertTriangle className="h-3 w-3" />
                            Priority queue
                        </span>
                    </div>
                    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                        <table className="w-full text-left text-[13px]">
                            <thead className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                                <tr>
                                    <th className="px-4 py-2.5">Date</th>
                                    <th className="px-4 py-2.5">Category</th>
                                    <th className="px-4 py-2.5">Scope</th>
                                    <th className="px-4 py-2.5">kgCO₂e</th>
                                    <th className="px-4 py-2.5">Flags</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <tr key={i}>
                                            {[...Array(5)].map((_, j) => (
                                                <td key={j} className="px-4 py-3">
                                                    <div className="skeleton h-4 w-3/4" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : suspiciousRecords.length ? (
                                    suspiciousRecords.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="transition-colors hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-2.5 tabular-nums text-gray-700">
                                                {row.activity_date}
                                            </td>
                                            <td className="px-4 py-2.5 text-gray-700">
                                                {row.activity_category}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span className="rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-semibold text-gray-600">
                                                    {row.scope}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 tabular-nums font-medium text-gray-800">
                                                {row.emission_amount_kgco2e}
                                            </td>
                                            <td className="px-4 py-2.5 text-[12px] text-orange-600 font-medium">
                                                {row.suspicious_flags.join(", ")}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            className="px-4 py-8 text-center text-[13px] text-gray-400"
                                            colSpan={5}
                                        >
                                            No suspicious records in the queue.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right sidebar cards */}
                <div className="grid gap-6 content-start">
                    {/* Review Status */}
                    <div
                        className="rounded-2xl border border-[var(--color-border)] bg-white p-5"
                        style={{ boxShadow: "var(--shadow-card)" }}
                    >
                        <h3 className="text-[15px] font-semibold text-gray-900">
                            Review Status
                        </h3>
                        <div className="mt-4 space-y-4">
                            {[
                                { label: "Pending", status: "PENDING", count: statusSummary.pending, color: "bg-amber-400" },
                                { label: "Approved", status: "APPROVED", count: statusSummary.approved, color: "bg-emerald-500" },
                                { label: "Rejected", status: "REJECTED", count: statusSummary.rejected, color: "bg-rose-500" },
                            ].map((item) => (
                                <div key={item.status}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={item.status} />
                                        </div>
                                        <span className="text-lg font-semibold tabular-nums text-gray-900">
                                            {item.count}
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${item.color} transition-all duration-500`}
                                            style={{ width: `${Math.round((item.count / total) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Uploads */}
                    <div
                        className="rounded-2xl border border-[var(--color-border)] bg-white p-5"
                        style={{ boxShadow: "var(--shadow-card)" }}
                    >
                        <h3 className="text-[15px] font-semibold text-gray-900">
                            Recent Uploads
                        </h3>
                        <p className="mt-1 text-[12px] text-gray-400">
                            Latest activity dates in the ingestion queue.
                        </p>
                        <div className="mt-4 space-y-2">
                            {recentUploads.length ? (
                                recentUploads.map((row) => (
                                    <div
                                        key={`upload-${row.id}`}
                                        className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5 transition-colors hover:bg-gray-50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[13px] font-medium text-gray-800">
                                                Source #{row.data_source_id}
                                            </span>
                                            <span className="text-[12px] tabular-nums text-gray-400">
                                                {row.activity_date}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-[12px] text-gray-500">
                                            {row.activity_category}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[13px] text-gray-400">
                                    No recent uploads yet.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
