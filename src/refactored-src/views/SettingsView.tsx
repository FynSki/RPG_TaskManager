/**
 * SettingsView — widok ustawień
 * Zawiera: Notifications, Mobile App info, Export/Import, Rewarded Ad, Danger Zone
 */

import { useState } from 'react';
import { useAppContext } from "../context/AppContext";
import { DataManagement } from "../../components/DataManagement";
import { NotificationSettingsPanel } from "../../components/NotificationSettingsPanel";
import { showRewardedAd } from "../../services/AdService";

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.codefusion.rpgplanner';
const REWARDED_GOLD = 50;

function isNativePlatform(): boolean {
    return (
        typeof window !== 'undefined' &&
        (window as any).Capacitor?.isNativePlatform?.() === true
    );
}

export function SettingsView() {
    const {
        tasks, character, projects, skills, taskClasses, recurringCompletions,
        showResetConfirm, setShowResetConfirm,
        setShowAboutPage,
        resetProgress, importData,
        updateCharacter,
    } = useAppContext();

    const [isLoadingAd, setIsLoadingAd] = useState(false);
    const [adMessage, setAdMessage] = useState<string | null>(null);
    const isNative = isNativePlatform();

    async function handleWatchAd() {
        setIsLoadingAd(true);
        setAdMessage(null);
        try {
            const rewarded = await showRewardedAd();
            if (rewarded) {
                updateCharacter({
                    gold: (character.gold ?? 0) + REWARDED_GOLD,
                    totalGold: (character.totalGold ?? 0) + REWARDED_GOLD,
                });
                setAdMessage(`+${REWARDED_GOLD} 🪙 Gold added to your account!`);
            } else {
                setAdMessage('Ad was not completed. No reward given.');
            }
        } catch {
            setAdMessage('Ad not available right now. Try again later.');
        }
        setIsLoadingAd(false);
    }

    return (
        <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Settings</h2>
                <button
                    onClick={() => setShowAboutPage(true)}
                    className="sm:hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                    <span>ℹ️</span>
                    <span className="font-semibold">About</span>
                </button>
            </div>

            <div className="space-y-6">
                {/* Powiadomienia */}
                <NotificationSettingsPanel />

                {/* Info o aplikacji mobilnej — tylko na web */}
                {!isNative && (
                    <div className="bg-slate-900 rounded-xl p-6 border border-indigo-700/50">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            📱 Mobile App Available
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Get the full RPG Planner experience on your Android device.
                            Push notifications, better performance and offline support!
                        </p>
                        <a
                            href={GOOGLE_PLAY_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg transition font-semibold text-sm"
                        >
                            <span>▶</span>
                            Download on Google Play
                        </a>
                    </div>
                )}

                {/* Reklama za Gold — tylko na mobile */}
                {isNative && (
                    <div className="bg-slate-900 rounded-xl p-6 border border-yellow-700/30">
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            🪙 Earn Gold
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Watch a short ad to earn{' '}
                            <span className="text-yellow-400 font-semibold">{REWARDED_GOLD} Gold</span>{' '}
                            — use it to unlock new Skills and Task Classes.
                        </p>

                        <div className="flex items-center gap-3">
                            <div className="bg-slate-800 rounded-lg px-4 py-2 border border-slate-700">
                                <span className="text-yellow-400 font-bold">
                                    🪙 {(character.gold ?? 0).toLocaleString()}
                                </span>
                                <span className="text-slate-400 text-xs ml-1">current</span>
                            </div>
                            <button
                                onClick={handleWatchAd}
                                disabled={isLoadingAd}
                                className="flex items-center gap-2 px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition font-semibold disabled:opacity-50"
                            >
                                {isLoadingAd ? (
                                    <><span className="animate-spin">⏳</span> Loading...</>
                                ) : (
                                    <><span>▶️</span> Watch Ad (+{REWARDED_GOLD} Gold)</>
                                )}
                            </button>
                        </div>

                        {adMessage && (
                            <p className={`mt-3 text-sm ${adMessage.includes('+') ? 'text-green-400' : 'text-slate-400'}`}>
                                {adMessage}
                            </p>
                        )}
                    </div>
                )}

                {/* Export / Import */}
                <DataManagement
                    tasks={tasks}
                    character={character}
                    projects={projects}
                    skills={skills}
                    taskClasses={taskClasses}
                    recurringCompletions={recurringCompletions}
                    onImport={(data) => importData(data)}
                />

                {/* Danger Zone */}
                <div className="bg-rose-900 rounded-xl p-6 border border-rose-700">
                    <h3 className="text-xl font-semibold text-rose-100 mb-2">Danger Zone</h3>
                    <p className="text-rose-200 text-sm mb-4">
                        Reset all progress and start fresh. This action cannot be undone.
                    </p>
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        className="bg-rose-700 hover:bg-rose-600 text-white px-6 py-3 rounded-lg"
                    >
                        Reset All Progress
                    </button>

                    <div className="mt-4 pt-4 border-t border-rose-700">
                        <p className="text-rose-200 text-sm mb-3">
                            Want to see the welcome screen again?
                        </p>
                        <button
                            onClick={() => {
                                localStorage.removeItem('hasSeenOnboarding');
                                window.location.reload();
                            }}
                            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition text-sm"
                        >
                            🎓 Show Welcome Screen
                        </button>
                    </div>
                </div>
            </div>

            {/* Reset confirm modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
                        <h3 className="text-2xl font-semibold mb-4 text-rose-400">⚠️ Confirm Reset</h3>
                        <p className="text-slate-300 mb-6">
                            Are you sure you want to reset all progress? This will delete all tasks,
                            projects, classes, skills and stats.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={resetProgress}
                                className="flex-1 bg-rose-700 hover:bg-rose-600 text-white px-6 py-3 rounded-lg"
                            >
                                Yes, Reset Everything
                            </button>
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 bg-slate-900 text-slate-300 px-6 py-3 rounded-lg hover:bg-slate-700 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}