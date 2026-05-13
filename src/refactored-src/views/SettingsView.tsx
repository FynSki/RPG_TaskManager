/**
 * SettingsView — widok ustawień
 * Wyciągnięty z App.tsx
 */

import { useAppContext } from "../context/AppContext";
import { DataManagement } from "../../components/DataManagement";

export function SettingsView() {
    const {
        tasks, character, projects, skills, taskClasses, recurringCompletions,
        showResetConfirm, setShowResetConfirm,
        setShowAboutPage,
        resetProgress, importData,
    } = useAppContext();

    return (
        <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Settings</h2>
                <button
                    onClick={() => setShowAboutPage(true)}
                    className="sm:hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-lg"
                >
                    <span>ℹ️</span>
                    <span className="font-semibold">About</span>
                </button>
            </div>

            <div className="space-y-6">
                <DataManagement
                    tasks={tasks}
                    character={character}
                    projects={projects}
                    skills={skills}
                    taskClasses={taskClasses}
                    recurringCompletions={recurringCompletions}
                    onImport={(data) => importData(data)}
                />

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
                        <p className="text-rose-200 text-sm mb-3">Want to see the welcome screen again?</p>
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