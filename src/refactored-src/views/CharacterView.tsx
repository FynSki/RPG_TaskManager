/**
 * CharacterView — widok postaci, statystyk, skilli i klas
 * Poprawka: używa updateCharacter z kontekstu zamiast localStorage workaround
 */

import { useAppContext } from "../context/AppContext";
import type { StatType } from "../types";
import { AVATARS, STAT_DESCRIPTIONS } from "../constants";

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

export function CharacterView() {
    const {
        character, updateCharacter,
        tasks, skills, taskClasses,
        xpForNextLevel,
        isSkillPanelOpen, setIsSkillPanelOpen,
        isTaskClassPanelOpen, setIsTaskClassPanelOpen,
        showStatInfo, setShowStatInfo,
        newSkillName, setNewSkillName,
        newClassName, setNewClassName,
        newClassStat, setNewClassStat,
        addSkill, deleteSkill,
        addTaskClass, deleteTaskClass,
        spendPoint,
        unlockedSkillSlots, unlockedClassSlots,
        nextSkillUnlockCost, nextClassUnlockCost,
        canAffordSkill, canAffordClass,
        unlockSkillSlot, unlockClassSlot,
    } = useAppContext();

    const STATS = [
        { name: "Strength", key: "strength", icon: "💪" },
        { name: "Endurance", key: "endurance", icon: "🏃" },
        { name: "Intelligence", key: "intelligence", icon: "🧠" },
        { name: "Agility", key: "agility", icon: "⚡" },
        { name: "Charisma", key: "charisma", icon: "✨" },
    ] as const;

    return (
        <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Character Profile</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Karta postaci */}
                <div className="bg-slate-900 rounded-lg p-4 sm:p-6 border border-slate-700">
                    <div className="flex items-center gap-3 sm:gap-4 mb-6">
                        <div className="text-5xl sm:text-6xl flex-shrink-0">{character.avatar}</div>
                        <div className="flex-1 min-w-0">
                            <input
                                type="text"
                                value={character.name}
                                onChange={(e) => updateCharacter({ name: e.target.value })}
                                className="w-full text-xl sm:text-2xl font-bold bg-transparent border-b-2 border-slate-700 focus:border-indigo-500 outline-none pb-1"
                            />
                            <p className="text-slate-400 mt-1 text-sm sm:text-base">Level {character.level}</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between text-xs sm:text-sm mb-2">
                            <span>XP Progress</span>
                            <span className="text-indigo-400">{character.xp} / {xpForNextLevel}</span>
                        </div>
                        <ProgressBar value={character.xp} max={xpForNextLevel} />
                    </div>

                    {/* Gold */}
                    <div className="mb-4 flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3 border border-yellow-700/30">
                        <span className="text-sm text-slate-400">Gold</span>
                        <span className="text-yellow-400 font-bold text-lg">🪙 {(character.gold ?? 0).toLocaleString()}</span>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Choose Avatar</label>
                        <select
                            value={character.avatar}
                            onChange={(e) => updateCharacter({ avatar: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            style={{ fontFamily: 'system-ui' }}
                        >
                            {AVATARS.map(avatar => (
                                <option key={avatar} value={avatar}>{avatar}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                        <div className="flex justify-between">
                            <span>Total XP Earned:</span>
                            <span className="text-indigo-400 font-semibold">{character.totalXp}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Gold Earned:</span>
                            <span className="text-yellow-400 font-semibold">🪙 {(character.totalGold ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Quests:</span>
                            <span className="text-indigo-400 font-semibold">{tasks.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Completed:</span>
                            <span className="text-indigo-400 font-semibold">{tasks.filter(t => t.completed).length}</span>
                        </div>
                    </div>
                </div>

                {/* Unspent Points */}
                {character.unspentPoints > 0 && (
                    <div className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-lg p-4 sm:p-6 border-2 border-yellow-600/50 lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold text-yellow-400">⭐ Level Up!</h3>
                                <p className="text-sm text-slate-300 mt-1">
                                    You have {character.unspentPoints} unspent {character.unspentPoints === 1 ? 'point' : 'points'}
                                </p>
                            </div>
                            <div className="text-3xl sm:text-4xl font-bold text-yellow-400">{character.unspentPoints}</div>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Click the <span className="text-yellow-400 font-bold">+</span> button next to any stat to spend your points!
                        </p>
                    </div>
                )}

                {/* Statystyki */}
                <div className="bg-slate-900 rounded-lg p-4 sm:p-6 border border-slate-700">
                    <h3 className="text-lg sm:text-xl font-semibold mb-4">Stats</h3>
                    <div className="space-y-4">
                        {STATS.map(stat => {
                            const value = character[stat.key as keyof typeof character] as number;
                            const progress = character[`${stat.key}Progress` as keyof typeof character] as number;
                            return (
                                <div key={stat.key}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs sm:text-sm">{stat.icon} {stat.name}</span>
                                            <button
                                                onClick={() => setShowStatInfo(stat.key)}
                                                className="w-5 h-5 rounded-full bg-slate-800 border border-slate-600 hover:border-indigo-500 transition flex items-center justify-center text-xs"
                                            >
                                                ℹ️
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-base sm:text-lg font-bold text-indigo-400">{value}</span>
                                            {character.unspentPoints > 0 && (
                                                <button
                                                    onClick={() => spendPoint(stat.key as StatType)}
                                                    className="w-7 h-7 rounded-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold transition flex items-center justify-center shadow-lg"
                                                >
                                                    +
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <ProgressBar value={progress} max={value + 1} />
                                    <p className="text-xs text-slate-400 mt-1">{progress}/{value + 1} tasks to level up</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Skills panel */}
            <div className="bg-slate-900 rounded-lg border border-slate-700 mt-6 overflow-hidden">
                <button
                    onClick={() => setIsSkillPanelOpen(!isSkillPanelOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-900 hover:bg-slate-800 transition-colors text-left"
                >
                    <div>
                        <h3 className="text-lg font-semibold text-slate-100">Skills Management</h3>
                        <span className="text-xs text-slate-500">{skills.length}/{unlockedSkillSlots} slots used</span>
                    </div>
                    <span className="text-xl text-indigo-400">{isSkillPanelOpen ? '▼' : '▶'}</span>
                </button>

                {isSkillPanelOpen && (
                    <div className="p-4 border-t border-slate-700">
                        <p className="text-sm text-slate-400 mb-4">
                            Create custom skills to track personal growth. Assign skills to tasks to level them up!
                        </p>

                        {skills.length >= unlockedSkillSlots && (
                            <div className="flex items-center justify-between bg-slate-800 rounded-lg p-3 border border-yellow-700/30 mb-4">
                                <div>
                                    <span className="text-sm text-slate-300">Unlock next skill slot</span>
                                    <p className="text-xs text-slate-500 mt-0.5">Cost: 🪙 {nextSkillUnlockCost} Gold</p>
                                </div>
                                <button
                                    onClick={unlockSkillSlot}
                                    disabled={!canAffordSkill}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition
                                        ${canAffordSkill
                                            ? "bg-yellow-600 hover:bg-yellow-500 text-white"
                                            : "bg-slate-700 text-slate-500 cursor-not-allowed"}`}
                                    title={!canAffordSkill ? `Need ${nextSkillUnlockCost} 🪙 (have ${character.gold})` : ''}
                                >
                                    🪙 {nextSkillUnlockCost} unlock
                                </button>
                            </div>
                        )}

                        <div className="flex gap-3 mb-4">
                            <input
                                type="text"
                                placeholder="Skill name (e.g. Cooking, Guitar)"
                                value={newSkillName}
                                onChange={(e) => setNewSkillName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                                disabled={skills.length >= unlockedSkillSlots}
                                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 disabled:opacity-50"
                            />
                            <button
                                onClick={addSkill}
                                disabled={skills.length >= unlockedSkillSlots}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Skill
                            </button>
                        </div>

                        <div className="space-y-3">
                            {skills.length > 0 ? skills.map(s => (
                                <div key={s.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: s.color }}>
                                                {s.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-100">{s.name}</h4>
                                                <p className="text-xs text-slate-400">Level {s.level}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteSkill(s.id)} className="text-rose-500 hover:text-rose-400 text-sm">Delete</button>
                                    </div>
                                    <ProgressBar value={s.progress} max={s.level + 1} />
                                    <p className="text-xs text-slate-400 mt-1">{s.progress}/{s.level + 1} tasks completed</p>
                                </div>
                            )) : (
                                <p className="text-slate-400 text-sm">No skills yet — add one to start tracking your personal growth.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Task Classes panel */}
            <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden mt-4">
                <button
                    onClick={() => setIsTaskClassPanelOpen(!isTaskClassPanelOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-900 hover:bg-slate-800 transition-colors text-left"
                >
                    <div>
                        <h3 className="text-lg font-semibold text-slate-100">Task Classes (map to stats)</h3>
                        <span className="text-xs text-slate-500">{taskClasses.length}/{unlockedClassSlots} slots used</span>
                    </div>
                    <span className="text-xl text-indigo-400">{isTaskClassPanelOpen ? '▼' : '▶'}</span>
                </button>

                {isTaskClassPanelOpen && (
                    <div className="p-4 border-t border-slate-700">
                        {taskClasses.length >= unlockedClassSlots && (
                            <div className="flex items-center justify-between bg-slate-800 rounded-lg p-3 border border-yellow-700/30 mb-4">
                                <div>
                                    <span className="text-sm text-slate-300">Unlock next class slot</span>
                                    <p className="text-xs text-slate-500 mt-0.5">Cost: 🪙 {nextClassUnlockCost} Gold</p>
                                </div>
                                <button
                                    onClick={unlockClassSlot}
                                    disabled={!canAffordClass}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition
                                        ${canAffordClass
                                            ? "bg-yellow-600 hover:bg-yellow-500 text-white"
                                            : "bg-slate-700 text-slate-500 cursor-not-allowed"}`}
                                    title={!canAffordClass ? `Need ${nextClassUnlockCost} 🪙 (have ${character.gold})` : ''}
                                >
                                    🪙 {nextClassUnlockCost} unlock
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Class name (e.g. Running)"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addTaskClass()}
                                disabled={taskClasses.length >= unlockedClassSlots}
                                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 disabled:opacity-50"
                            />
                            <select
                                value={newClassStat}
                                onChange={(e) => setNewClassStat(e.target.value as StatType)}
                                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                            >
                                <option value="strength">Strength</option>
                                <option value="endurance">Endurance</option>
                                <option value="intelligence">Intelligence</option>
                                <option value="agility">Agility</option>
                                <option value="charisma">Charisma</option>
                            </select>
                            <button
                                onClick={addTaskClass}
                                disabled={taskClasses.length >= unlockedClassSlots}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Class
                            </button>
                        </div>

                        <div className="space-y-2">
                            {taskClasses.map(c => (
                                <div key={c.id} className="flex items-center justify-between bg-slate-800 p-3 rounded border border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: c.color }}>{c.name[0]}</div>
                                        <div>
                                            <div className="font-medium text-slate-100">{c.name}</div>
                                            <div className="text-xs text-slate-400">{c.statType}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteTaskClass(c.id)} className="text-rose-500 hover:text-rose-400 text-sm">Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Stat info modal */}
            {showStatInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold capitalize">
                                {showStatInfo === "strength" && "💪"}
                                {showStatInfo === "endurance" && "🏃"}
                                {showStatInfo === "intelligence" && "🧠"}
                                {showStatInfo === "agility" && "⚡"}
                                {showStatInfo === "charisma" && "✨"}
                                {" "}{showStatInfo}
                            </h3>
                            <button onClick={() => setShowStatInfo(null)} className="text-slate-400 hover:text-slate-200 text-2xl">✕</button>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {STAT_DESCRIPTIONS[showStatInfo as StatType]}
                        </p>
                        <button
                            onClick={() => setShowStatInfo(null)}
                            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}