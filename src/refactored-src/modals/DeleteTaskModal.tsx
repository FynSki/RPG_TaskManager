/**
 * DeleteTaskModal — modal potwierdzenia usunięcia zadania
 *
 * Pokazuje ile XP i Gold gracz straci jeśli zadanie było nieukończone.
 * Nie pobiera opłaty gold — tylko wymaga świadomego potwierdzenia.
 */

import { useAppContext } from "../context/AppContext";

export function DeleteTaskModal() {
    const {
        pendingDeleteTaskId,
        setPendingDeleteTaskId,
        confirmDeleteTask,
        tasks,
    } = useAppContext();

    if (!pendingDeleteTaskId) return null;

    const task = tasks.find(t => t.id === pendingDeleteTaskId);
    if (!task) return null;

    const isActive = !task.completed;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700 shadow-2xl">
                <h3 className="text-xl font-semibold mb-2 text-rose-400">🗑️ Delete Quest?</h3>

                <p className="text-slate-300 mb-4">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-slate-100">"{task.name}"</span>?
                </p>

                {/* Ostrzeżenie tylko dla nieukończonych zadań */}
                {isActive && (
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 mb-5">
                        <p className="text-sm text-slate-400 mb-2">
                            This quest is still active. You would have earned:
                        </p>
                        <div className="flex gap-4">
                            <span className="text-sm font-semibold text-indigo-400">
                                ✨ {task.xpReward} XP
                            </span>
                            <span className="text-sm font-semibold text-yellow-400">
                                🪙 {task.goldReward} Gold
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={confirmDeleteTask}
                        className="flex-1 bg-rose-700 hover:bg-rose-600 text-white px-6 py-3 rounded-lg transition font-medium"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => setPendingDeleteTaskId(null)}
                        className="flex-1 bg-slate-900 text-slate-300 px-6 py-3 rounded-lg hover:bg-slate-700 transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}