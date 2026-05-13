/**
 * WeeklyView — widok tygodniowy
 * Wyciągnięty z App.tsx
 */

import { useAppContext } from "../context/AppContext";
import { getTasksForDate, isTaskCompletedOnDate, getDayName, formatShortDate } from "../utils";

export function WeeklyView() {
    const {
        weekDates, selectedDate, setSelectedDate,
        today, tasks, recurringCompletions,
        goToPreviousWeek, goToNextWeek,
        toggleTask, openEditModal, openTaskModal,
    } = useAppContext();

    return (
        <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Weekly Quests</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={goToPreviousWeek}
                        className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 hover:bg-slate-700 transition"
                    >
                        ←
                    </button>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                    />
                    <button
                        onClick={goToNextWeek}
                        className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 hover:bg-slate-700 transition"
                    >
                        →
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {weekDates.map(date => {
                    const dayTasks = getTasksForDate(tasks, date);
                    const completedCount = dayTasks.filter(t =>
                        isTaskCompletedOnDate(t, date, recurringCompletions)
                    ).length;
                    const isToday = date === today;

                    return (
                        <div
                            key={date}
                            className={`bg-slate-900 rounded-lg p-4 border ${isToday ? "border-indigo-500 ring-2 ring-indigo-500" : "border-slate-700"
                                }`}
                        >
                            <div className="text-center mb-3">
                                <p className="text-xs text-slate-400">{getDayName(date)}</p>
                                <p className={`text-lg font-semibold ${isToday ? "text-indigo-400" : ""}`}>
                                    {formatShortDate(date)}
                                </p>
                                {dayTasks.length > 0 && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        {completedCount}/{dayTasks.length}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                {dayTasks.map(task => {
                                    const isCompleted = isTaskCompletedOnDate(task, date, recurringCompletions);
                                    return (
                                        <div
                                            key={task.id}
                                            onClick={(e) => {
                                                if ((e.target as HTMLElement).tagName !== 'INPUT') {
                                                    openEditModal(task);
                                                }
                                            }}
                                            className={`text-xs p-2 rounded border border-slate-700 cursor-pointer ${isCompleted
                                                    ? "bg-slate-800 opacity-60"
                                                    : "bg-slate-900 hover:bg-slate-800"
                                                }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={isCompleted}
                                                    onChange={() => toggleTask(task.id, date)}
                                                    className="mt-0.5 w-3 h-3 rounded border-slate-600"
                                                />
                                                <span className={isCompleted ? "line-through text-slate-500" : ""}>
                                                    {task.name}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => openTaskModal(date)}
                                className="w-full mt-3 text-xs py-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700"
                            >
                                + Add
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}