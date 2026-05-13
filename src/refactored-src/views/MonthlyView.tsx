/**
 * MonthlyView — widok miesięczny (kalendarz)
 * Wyciągnięty z App.tsx
 */

import { useAppContext } from "../context/AppContext";
import { getTasksForDate, isTaskCompletedOnDate } from "../utils";

export function MonthlyView() {
    const {
        monthDates, selectedMonth, setSelectedMonth,
        today, tasks, recurringCompletions,
        goToPreviousMonth, goToNextMonth,
        setSelectedDayModal,
    } = useAppContext();

    return (
        <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-semibold">Monthly Quests</h2>
                <div className="flex items-center gap-2 sm:gap-3 justify-center">
                    <button
                        onClick={goToPreviousMonth}
                        className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 hover:bg-slate-700 transition"
                    >
                        ←
                    </button>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-2 sm:px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm sm:text-base"
                    />
                    <button
                        onClick={goToNextMonth}
                        className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 hover:bg-slate-700 transition"
                    >
                        →
                    </button>
                </div>
            </div>

            {/* Nagłówki dni tygodnia */}
            <div className="mb-4">
                <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs sm:text-sm font-semibold text-slate-400 mb-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                        <div key={day}>{day}</div>
                    ))}
                </div>
            </div>

            {/* Kalendarz */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {monthDates.map((date, idx) => {
                    if (!date) {
                        return <div key={`empty-${idx}`} className="aspect-square bg-slate-900 rounded-lg" />;
                    }

                    const dayTasks = getTasksForDate(tasks, date);
                    const completedCount = dayTasks.filter(t =>
                        isTaskCompletedOnDate(t, date, recurringCompletions)
                    ).length;
                    const isToday = date === today;

                    return (
                        <button
                            key={date}
                            onClick={() => setSelectedDayModal(new Date(date))}
                            className={`bg-slate-900 rounded-lg p-3 sm:p-4 border ${isToday
                                    ? "border-indigo-500 ring-1 sm:ring-2 ring-indigo-500"
                                    : "border-slate-700"
                                } hover:bg-slate-800 transition-all cursor-pointer aspect-square flex flex-col items-center justify-center gap-1`}
                        >
                            <p className={`text-base sm:text-xl font-semibold ${isToday ? "text-indigo-400" : "text-slate-100"
                                }`}>
                                {date.split("-")[2]}
                            </p>

                            {dayTasks.length > 0 && (
                                <div className="flex flex-col items-center gap-0.5">
                                    <div className={`text-xs sm:text-sm font-medium ${completedCount === dayTasks.length
                                            ? "text-green-400"
                                            : "text-slate-300"
                                        }`}>
                                        {completedCount}/{dayTasks.length}
                                    </div>
                                    {completedCount === dayTasks.length && dayTasks.length > 0 && (
                                        <span className="text-xs">✓</span>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}