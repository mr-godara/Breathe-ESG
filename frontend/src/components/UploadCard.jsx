import React, { useRef, useState } from "react";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";

export default function UploadCard({ title, description, onUpload, busy }) {
    const inputRef = useRef(null);
    const [fileName, setFileName] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file) => {
        if (!file) return;
        setFileName(file.name);
        onUpload(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        handleFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    return (
        <div
            className="rounded-2xl border border-[var(--color-border)] bg-white p-5"
            style={{ boxShadow: "var(--shadow-card)" }}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-gray-100 p-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                        <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
                        <p className="mt-1 text-[13px] text-gray-500 leading-5">{description}</p>
                    </div>
                </div>
                <span className="flex-shrink-0 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    CSV
                </span>
            </div>

            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.click()}
                className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 transition-colors ${
                    isDragging
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50"
                }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(event) => handleFile(event.target.files?.[0] || null)}
                />
                {busy ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        <span className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
                            Processing…
                        </span>
                    </>
                ) : fileName ? (
                    <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="mt-2 text-xs font-medium text-gray-600 truncate max-w-full">
                            {fileName}
                        </span>
                        <span className="mt-1 text-[11px] text-gray-400">
                            Click or drop to replace
                        </span>
                    </>
                ) : (
                    <>
                        <Upload className="h-5 w-5 text-gray-400" />
                        <span className="mt-2 text-xs font-medium text-gray-600">
                            Drop a CSV file here or click to browse
                        </span>
                        <span className="mt-1 text-[11px] text-gray-400">
                            Records are preserved and flagged before normalization
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
