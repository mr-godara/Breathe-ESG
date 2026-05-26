import React, { useState } from "react";

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
                message: "SAP upload failed. Check file format or source IDs.",
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
                message: "Utility upload failed. Check file format or source IDs.",
            });
        } finally {
            setUtilityBusy(false);
        }
    };

    return (
        <div className="grid gap-6">
            <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6">
                <h2 className="text-xl font-semibold">Upload Center</h2>
                <p className="mt-2 text-sm text-neutral-600">
                    Use tenant-scoped source IDs to keep ingestion traceable.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div>
                        <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                            Organization ID
                        </label>
                        <input
                            value={organizationId}
                            onChange={(event) => setOrganizationId(event.target.value)}
                            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                            SAP Source ID
                        </label>
                        <input
                            value={sapSourceId}
                            onChange={(event) => setSapSourceId(event.target.value)}
                            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                            Utility Source ID
                        </label>
                        <input
                            value={utilitySourceId}
                            onChange={(event) => setUtilitySourceId(event.target.value)}
                            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
                        />
                    </div>
                </div>
                {status ? (
                    <div
                        className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                            status.tone === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                                : "border-rose-200 bg-rose-50 text-rose-900"
                        }`}
                    >
                        {status.message}
                    </div>
                ) : (
                    <p className="mt-4 text-sm text-neutral-500">
                        Upload results will appear here with validation counts.
                    </p>
                )}
            </div>

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
