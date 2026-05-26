import React, { useState } from "react";
import {
    CheckCircle2,
    AlertCircle,
    X,
    Settings2,
} from "lucide-react";

import UploadCard from "../components/UploadCard";
import { uploadSapCsv, uploadUtilityCsv } from "../services/api";

export default function UploadPage() {
    const [organizationId, setOrganizationId] = useState("1");
    const [sapSourceId, setSapSourceId] = useState("1");
    const [utilitySourceId, setUtilitySourceId] = useState("2");
    const [sapBusy, setSapBusy] = useState(false);
    const [utilityBusy, setUtilityBusy] = useState(false);
    const [status, setStatus] = useState(null);

    const handleSapUpload = async (file) => {
        if (!file) return;
        setSapBusy(true);
        setStatus(null);
        try {
            const response = await uploadSapCsv({
                organizationId,
                dataSourceId: sapSourceId,
                file,
            });
            setStatus({
                tone: "success",
                message: `SAP upload completed. ${response.created_records} records created, ${response.error_rows?.length || 0} errors.`,
            });
        } catch (error) {
            setStatus({
                tone: "error",
                message:
                    "SAP upload failed. Check file format or source IDs.",
            });
        } finally {
            setSapBusy(false);
        }
    };

    const handleUtilityUpload = async (file) => {
        if (!file) return;
        setUtilityBusy(true);
        setStatus(null);
        try {
            const response = await uploadUtilityCsv({
                organizationId,
                dataSourceId: utilitySourceId,
                file,
            });
            setStatus({
                tone: "success",
                message: `Utility upload completed. ${response.created_records} records created, ${response.error_rows?.length || 0} errors.`,
            });
        } catch (error) {
            setStatus({
                tone: "error",
                message:
                    "Utility upload failed. Check file format or source IDs.",
            });
        } finally {
            setUtilityBusy(false);
        }
    };

    return (
        <div className="grid gap-6">
            {/* ── Config card ───────────────────────────────── */}
            <div
                className="rounded-2xl border border-[var(--color-border)] bg-white p-5"
                style={{ boxShadow: "var(--shadow-card)" }}
            >
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-gray-100 p-2">
                            <Settings2 className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                            <h2
                                className="text-lg font-semibold text-gray-900"
                                style={{ fontFamily: "'Fraunces', serif" }}
                            >
                                Upload Center
                            </h2>
                            <p className="mt-1 text-[13px] text-gray-500">
                                Use tenant-scoped source IDs to keep ingestion
                                traceable.
                            </p>
                        </div>
                    </div>
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold text-gray-500">
                        Evidence-first ingestion
                    </span>
                </div>

                {/* Form fields */}
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div>
                        <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                            Organization ID
                        </label>
                        <input
                            value={organizationId}
                            onChange={(event) =>
                                setOrganizationId(event.target.value)
                            }
                            className="mt-1.5 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                            SAP Source ID
                        </label>
                        <input
                            value={sapSourceId}
                            onChange={(event) =>
                                setSapSourceId(event.target.value)
                            }
                            className="mt-1.5 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                            Utility Source ID
                        </label>
                        <input
                            value={utilitySourceId}
                            onChange={(event) =>
                                setUtilitySourceId(event.target.value)
                            }
                            className="mt-1.5 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10"
                        />
                    </div>
                </div>

                {/* Status banner */}
                {status ? (
                    <div
                        className={`mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm animate-fade-in ${
                            status.tone === "success"
                                ? "border-[var(--color-approved-border)] bg-[var(--color-approved-bg)] text-[var(--color-approved-text)]"
                                : "border-[var(--color-rejected-border)] bg-[var(--color-rejected-bg)] text-[var(--color-rejected-text)]"
                        }`}
                    >
                        {status.tone === "success" ? (
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="flex-1">{status.message}</span>
                        <button
                            type="button"
                            onClick={() => setStatus(null)}
                            className="flex-shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ) : (
                    <p className="mt-4 text-[13px] text-gray-400">
                        Upload results will appear here with validation counts.
                    </p>
                )}
            </div>

            {/* ── Upload cards ──────────────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-2">
                <UploadCard
                    title="SAP MM Export"
                    description="German headers, mixed units, plant codes. Upload the CSV export."
                    onUpload={handleSapUpload}
                    busy={sapBusy}
                />
                <UploadCard
                    title="Utility Electricity"
                    description="Billing periods and meter IDs. Upload the CSV export."
                    onUpload={handleUtilityUpload}
                    busy={utilityBusy}
                />
            </div>
        </div>
    );
}
