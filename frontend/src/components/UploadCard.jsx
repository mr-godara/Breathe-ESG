import React from "react";

export default function UploadCard({ title, description, onUpload, busy }) {
    return (
        <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-neutral-600">{description}</p>
            <div className="mt-5">
                <input
                    type="file"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                    onChange={(event) => onUpload(event.target.files?.[0] || null)}
                />
            </div>
            {busy ? (
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-neutral-500">Uploading...</p>
            ) : null}
        </div>
    );
}
