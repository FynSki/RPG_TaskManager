/**
 * TopBar — górny pasek z avatarem, XP, Gold i statystykami
 * Wyciągnięty z App.tsx (linia ~724)
 */

import { useAppContext } from "../context/AppContext";

function ProgressBar({ value, max }: { value: number; max: number }) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div className="relative w-full h-2 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
            <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 to-indigo-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

export function TopBar() {
    const { character, xpForNextLevel, setShowAboutPage } = useAppContext();

    return (
        <div className="bg-slate-800 rounded-xl shadow-xl p-3 sm:p-4 md:p-6 mb-4 border border-slate-700 sticky top-0 z-50 backdrop-blur-md bg-slate-800/90">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">

                {/* Avatar + nazwa + mini statsy */}
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="text-4xl sm:text-5xl flex-shrink-0">{character.avatar}</div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent truncate">
                            {character.name}
                        </h1>
                        <p className="text-slate-400 text-xs sm:text-sm">Level {character.level} Adventurer</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-slate-300 text-sm">
                            <span>💪 {character.strength}</span>
                            <span>🏃 {character.endurance}</span>
                            <span>🧠 {character.intelligence}</span>
                            <span>⚡ {character.agility}</span>
                            <span>✨ {character.charisma}</span>
                        </div>
                    </div>
                </div>

                {/* XP + Gold + About */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:w-48 md:w-64 space-y-2">
                        {/* XP bar */}
                        <div>
                            <div className="flex justify-between text-xs sm:text-sm mb-1">
                                <span className="text-slate-400">XP</span>
                                <span className="text-indigo-400 font-semibold">
                                    {character.xp} / {xpForNextLevel}
                                </span>
                            </div>
                            <ProgressBar value={character.xp} max={xpForNextLevel} />
                        </div>

                        {/* Gold */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">Gold</span>
                            <span className="text-yellow-400 font-bold text-sm flex items-center gap-1">
                                🪙 {(character.gold ?? 0).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowAboutPage(true)}
                        className="relative w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition flex items-center justify-center shadow-lg hover:shadow-xl group flex-shrink-0"
                        title="About"
                    >
                        <span className="text-xl group-hover:rotate-12 transition-transform">ℹ️</span>
                        <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20" />
                    </button>
                </div>
            </div>
        </div>
    );
}