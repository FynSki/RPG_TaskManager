/**
 * Navigation — menu widoków (mobile + desktop)
 * Wyciągnięty z App.tsx. Jedna tablica NAV_ITEMS zamiast dwóch kopii.
 */

import type { ViewType } from "../types";
import { useAppContext } from "../context/AppContext";

const NAV_ITEMS: { id: ViewType; label: string; icon: string }[] = [
    { id: "character", label: "Character", icon: "⚔️" },
    { id: "activeTasks", label: "Active Tasks", icon: "🔥" },
    { id: "daily", label: "Daily", icon: "📅" },
    { id: "weekly", label: "Weekly", icon: "📊" },
    { id: "monthly", label: "Monthly", icon: "📆" },
    { id: "all", label: "All", icon: "📋" },
    { id: "projects", label: "Projects", icon: "🎯" },
    { id: "settings", label: "Settings", icon: "⚙️" },
];

export function Navigation() {
    const { view, setView, isPremium, showMobileMenu, setShowMobileMenu } = useAppContext();

    const visibleItems = NAV_ITEMS.filter(item => item.id !== "projects" || isPremium);
    const current = NAV_ITEMS.find(item => item.id === view);

    function handleSelect(id: ViewType) {
        setView(id);
        setShowMobileMenu(false);
    }

    return (
        <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 mb-4">
            {/* Mobile: current view + hamburger */}
            <div className="lg:hidden flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{current?.icon}</span>
                    <span className="font-semibold text-lg">{current?.label}</span>
                </div>
                <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-700 transition"
                    aria-label="Toggle menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showMobileMenu ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile: dropdown */}
            {showMobileMenu && (
                <div className="lg:hidden border-t border-slate-700 p-2 space-y-1">
                    {visibleItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleSelect(item.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all
                                ${view === item.id
                                    ? "bg-indigo-600 text-white shadow-lg"
                                    : "bg-slate-900 text-slate-300 hover:bg-slate-700"
                                }`}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Desktop: poziomy rząd */}
            <div className="hidden lg:block p-2 overflow-x-auto">
                <div className="flex gap-2">
                    {visibleItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleSelect(item.id)}
                            className={`px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap
                                ${view === item.id
                                    ? "bg-indigo-600 text-white shadow-lg"
                                    : "bg-slate-900 text-slate-300 hover:bg-slate-700"
                                }`}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}