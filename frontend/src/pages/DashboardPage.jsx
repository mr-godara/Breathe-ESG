import React, { useEffect, useMemo, useState } from "react";

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

    useEffect(() => {
        let active = true;
        async function loadStats() {
            try {
                const records = await getReviewQueue({ status: "ALL" });
                if (!active) return;
                setRecords(records);
                const suspicious = records.filter((row) => row.suspicious_flags?.length).length;
                const approved = records.filter((row) => row.review_status === "APPROVED").length;
                const rejected = records.filter((row) => row.review_status === "REJECTED").length;
                setStats({
                    total: records.length,
                    suspicious,
                    approved,
                    rejected,
                });
            } catch (error) {
                if (!active) return;
                setRecords([]);
                setStats({ total: 0, suspicious: 0, approved: 0, rejected: 0 });
            }
        }
        loadStats();
        return () => {
            active = false;
        };
    }, []);

    const suspiciousRecords = useMemo(
        () => records.filter((row) => row.suspicious_flags?.length).slice(0, 6),
        [records]
    );

    const recentUploads = useMemo(() => {
        return [...records]
            .filter((row) => row.activity_date)
            .sort((a, b) => b.activity_date.localeCompare(a.activity_date))
            .slice(0, 5);
    }, [records]);

    const statusSummary = useMemo(() => {
        const pending = records.filter((row) => row.review_status === "PENDING").length;
        const approved = records.filter((row) => row.review_status === "APPROVED").length;
        const rejected = records.filter((row) => row.review_status === "REJECTED").length;
        return { pending, approved, rejected };
    }, [records]);

    return (
        <div className="grid gap-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Total Records" value={stats.total} />
                <MetricCard label="Suspicious" value={stats.suspicious} tone="warning" />
                <MetricCard label="Approved" value={stats.approved} tone="success" />
                <MetricCard label="Rejected" value={stats.rejected} tone="danger" />
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Suspicious Records</h2>
                        <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                            Top priority
                        </span>
                    </div>
                    <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-100/70 text-xs uppercase tracking-[0.2em] text-neutral-500">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3">Scope</th>
                                    <th className="px-4 py-3">kgCO2e</th>
                                    <th className="px-4 py-3">Flags</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {suspiciousRecords.length ? (
                                    suspiciousRecords.map((row) => (
                                        <tr key={row.id}>
                                            <td className="px-4 py-3">{row.activity_date}</td>
                                            <td className="px-4 py-3">{row.activity_category}</td>
                                            <td className="px-4 py-3">{row.scope}</td>
                                            <td className="px-4 py-3">{row.emission_amount_kgco2e}</td>
                                            <td className="px-4 py-3">
                                                {row.suspicious_flags.join(", ")}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-sm text-neutral-500" colSpan={5}>
                                            No suspicious records in the queue.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid gap-6">
                    <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6">
                        <h3 className="text-lg font-semibold">Review Status</h3>
                        <div className="mt-4 grid gap-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-500">Pending</span>
                                <StatusBadge status="PENDING" />
                            </div>
                            <p className="text-right text-xl font-semibold">
                                {statusSummary.pending}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-500">Approved</span>
                                <StatusBadge status="APPROVED" />
                            </div>
                            <p className="text-right text-xl font-semibold">
                                {statusSummary.approved}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-500">Rejected</span>
                                <StatusBadge status="REJECTED" />
                            </div>
                            <p className="text-right text-xl font-semibold">
                                {statusSummary.rejected}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6">
                        <h3 className="text-lg font-semibold">Recent Uploads</h3>
                        <p className="mt-1 text-xs text-neutral-500">
                            Based on the latest activity dates in the ingestion queue.
                        </p>
                        <div className="mt-4 space-y-3 text-sm">
                            {recentUploads.length ? (
                                recentUploads.map((row) => (
                                    <div
                                        key={`upload-${row.id}`}
                                        className="rounded-xl border border-neutral-200 bg-white px-3 py-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Source #{row.data_source_id}</span>
                                            <span className="text-neutral-500">{row.activity_date}</span>
                                        </div>
                                        <p className="mt-1 text-neutral-500">{row.activity_category}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-neutral-500">No recent uploads yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
