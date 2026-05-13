/**
 * DayDetailModal — modal szczegółów dnia w widoku miesięcznym
 * Wyciągnięty z App.tsx
 */

import { useAppContext } from "../context/AppContext";
import { RarityBadge } from "../components/RarityBadge";
import { getTasksForDate, isTaskCompletedOnDate, getDayName, formatShortDate } from "../utils";

export function DayDetailModal() {
    const {
        selectedDayModal, setSelectedDayModal,
        tasks, recurringCompletions,
        projects, taskClasses, skills,
        toggleTask, openEditModal, openTaskModal,
    } = useAppContext();

    if (!selectedDayModal) return null;

    const dateStr = selectedDayModal.toISOString().split('T')[0];
    const dayTasks = getTasksForDate(tasks, dateStr);
    const completedCount = dayTasks.filter(t =>
        isTaskCompletedOnDate(t, dateStr, recurringCompletions)
    ).length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-slate-800 rounded-xl p-6 max-w-4xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-semibold">{getDayName(dateStr)}</h3>
                        <p className="text-slate-400 text-sm mt-1">
                            {formatShortDate(dateStr)} • {completedCount}/{dayTasks.length} completed
                        </p>
                    </div>
                    <button
                        onClick={() => setSelectedDayModal(null)}
                        className="text-slate-400 hover:text-slate-200 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Lista zadań */}
                <div className="space-y-3 mb-6">
                    {dayTasks.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <p className="text-lg mb-2">No quests for this day</p>
                            <p className="text-sm">Click "Add Quest" to create a new quest</p>
                        </div>
                    ) : (
                        dayTasks.map(task => {
                            const isCompleted = isTaskCompletedOnDate(task, dateStr, recurringCompletions);
                            const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
                            const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;
                            const skill = task.skillId ? skills.find(s => s.id === task.skillId) : null;

                            return (
                                <div
                                    key={task.id}
                                    className={`bg-slate-900 rounded-lg p-4 border border-slate-700 transition-all ${isCompleted ? "opacity-60" : ""}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isCompleted}
                                            onChange={() => toggleTask(task.id, dateStr)}
                                            className="mt-1 w-5 h-5 rounded border-slate-600 flex-shrink-0"
                                        />
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => {
                                                setSelectedDayModal(null);
                                                openEditModal(task);
                                            }}
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <h4 className={`font-semibold ${isCompleted ? "line-through text-slate-500" : "text-slate-100"}`}>
                                                    {task.name}
                                                </h4>
                                                <RarityBadge rarity={task.priority} showXP xp={task.xpReward} />
                                            </div>

                                            {task.description && (
                                                <p className={`text-sm mb-3 ${isCompleted ? "text-slate-600" : "text-slate-400"}`}>
                                                    {task.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-2 text-xs">
                                                <span className="px-3 py-1 rounded-full bg-yellow-900 text-yellow-300 border border-yellow-700">
                                                    🪙 {task.goldReward}
                                                </span>
                                                {project && (
                                                    <span className="px-3 py-1 rounded-full border" style={{ borderColor: project.color, color: project.color, backgroundColor: `${project.color}20` }}>
                                                        📁 {project.name}
                                                    </span>
                                                )}
                                                {taskClass && (
                                                    <span className="px-3 py-1 rounded-full border" style={{ borderColor: taskClass.color, color: taskClass.color, backgroundColor: `${taskClass.color}20` }}>
                                                        ⚔️ {taskClass.name}
                                                    </span>
                                                )}
                                                {skill && (
                                                    <span className="px-3 py-1 rounded-full border" style={{ borderColor: skill.color, color: skill.color, backgroundColor: `${skill.color}20` }}>
                                                        ✨ {skill.name}
                                                    </span>
                                                )}
                                                {task.isRecurring && (
                                                    <span className="px-3 py-1 rounded-full bg-purple-900 text-purple-300 border border-purple-700">
                                                        🔄 {task.recurringType}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Akcje */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setSelectedDayModal(null)}
                        className="flex-1 bg-slate-900 text-slate-300 px-6 py-3 rounded-lg hover:bg-slate-700 transition"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            setSelectedDayModal(null);
                            openTaskModal(dateStr);
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition"
                    >
                        + Add Quest
                    </button>
                </div>
            </div>
        </div>
    );
}