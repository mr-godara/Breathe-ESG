import React from "react";

export default function Layout({ pages, activePage, onNavigate, children }) {
    return (
        <div className="min-h-screen">
            <header className="px-6 py-6 lg:px-10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
                            Emissions Review
                        </p>
                        <h1 className="text-3xl font-semibold">ESG Intake Console</h1>
                    </div>
                    <nav className="flex flex-wrap gap-3">
                        {pages.map((page) => (
                            <button
                                key={page.key}
                                type="button"
                                onClick={() => onNavigate(page.key)}
                                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                    activePage === page.key
                                        ? "border-transparent bg-neutral-900 text-white"
                                        : "border-neutral-300 bg-white/60 text-neutral-700 hover:border-neutral-500"
                                }`}
                            >
                                {page.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>
            <main className="px-6 pb-16 lg:px-10">{children}</main>
        </div>
    );
}
