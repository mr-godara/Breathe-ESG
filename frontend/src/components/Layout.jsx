import React from "react";
import {
    LayoutDashboard,
    Upload,
    ClipboardList,
    Leaf,
    ChevronRight,
} from "lucide-react";

const NAV_ICONS = {
    dashboard: LayoutDashboard,
    uploads: Upload,
    reviews: ClipboardList,
};

export default function Layout({ pages, activePage, onNavigate, children }) {
    const activeLabel =
        pages.find((page) => page.key === activePage)?.label || "";

    return (
        <div className="flex min-h-screen bg-[var(--color-surface-secondary)]">
            {/* ── Sidebar ──────────────────────────────────── */}
            <aside className="hidden w-[260px] flex-shrink-0 flex-col border-r border-slate-800/60 bg-[var(--color-sidebar)] text-slate-100 lg:flex">
                {/* Brand */}
                <div className="px-5 pt-6 pb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                            <Leaf className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-[15px] font-semibold tracking-tight text-white" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                                Breathe ESG
                            </h1>
                        </div>
                    </div>
                    <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.15em] text-slate-500">
                        Intake Console
                    </p>
                </div>

                {/* Nav */}
                <nav className="flex flex-col gap-1 px-3 pt-2">
                    {pages.map((page) => {
                        const Icon = NAV_ICONS[page.key] || LayoutDashboard;
                        const isActive = activePage === page.key;
                        return (
                            <button
                                key={page.key}
                                type="button"
                                onClick={() => onNavigate(page.key)}
                                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
                                    isActive
                                        ? "bg-white/10 text-white shadow-sm"
                                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                }`}
                            >
                                <Icon
                                    className={`h-4 w-4 flex-shrink-0 ${
                                        isActive
                                            ? "text-emerald-400"
                                            : "text-slate-500 group-hover:text-slate-400"
                                    }`}
                                />
                                <span>{page.label}</span>
                                {isActive && (
                                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-500" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="mt-auto px-4 pb-5">
                    <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5">
                        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-500">
                            Environment
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">Local Development</p>
                    </div>
                </div>
            </aside>

            {/* ── Main area ────────────────────────────────── */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top navbar */}
                <header className="border-b border-[var(--color-border)] bg-white px-6 py-4 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-[12px] text-gray-400">
                                    <span>Analyst Workspace</span>
                                    <ChevronRight className="h-3 w-3" />
                                    <span className="text-gray-600 font-medium">{activeLabel}</span>
                                </div>
                                <h2
                                    className="mt-1 text-xl font-semibold text-gray-900"
                                    style={{ fontFamily: "'Fraunces', serif" }}
                                >
                                    {activeLabel}
                                </h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-500">
                                Data source integrity
                            </div>
                            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Audit ready
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
                    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
