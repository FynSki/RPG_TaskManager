/**
 * DailyView — widok dziennych zadañ
 * Wyci¹gniêty z App.tsx
 */

import { useAppContext } from "../context/AppContext";
import { TaskCard, EmptyState } from "../components/TaskCard";

export function DailyView() {
    const {
        sortedDailyTasks,
        selectedDate, setSelectedDate,
        recurringCompletions,
        projects, taskClasses, skills,
        toggleTask, openEditModal,
        requestDeleteTask,
        openTaskModal,
    } = useAppContext();

    return (
        <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-semibold">Daily Quests</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 w-full sm:w-auto"
                    />
                    <button
                        onClick={() => openTaskModal(selectedDate)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition w-full sm:w-auto"
                    >
                        + Add Quest
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {sortedDailyTasks.length === 0 ? (
                    <EmptyState />
                ) : (
                    sortedDailyTasks.map(task => {
                        const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
                        const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;
                        const skill = task.skillId ? skills.find(s => s.id === task.skillId) : null;

                        return (
                            <TaskCard
                                key={task.id}
                                task={task}
                                project={project}
                                taskClass={taskClass}
                                skill={skill}
                                recurringCompletions={recurringCompletions}
                                date={selectedDate}
                                onToggle={toggleTask}
                                onEdit={openEditModal}
                                onDelete={requestDeleteTask}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}