/**
 * ActiveTasksView — widok aktywnych zadań (dziś, backlog, jutro, bez terminu)
 * Wyciągnięty z App.tsx
 */

import { useAppContext } from "../context/AppContext";
import { formatShortDate } from "../utils";
import { TaskCard } from "../components/TaskCard";

export function ActiveTasksView() {
    const {
        sortedTodayTasks, sortedTomorrowTasks,
        sortedBacklogTasks, sortedNoDueDateTasks,
        today, tomorrow,
        projects, taskClasses, skills,
        recurringCompletions,
        toggleTask, openEditModal, requestDeleteTask,
        openTaskModal,
    } = useAppContext();

    return (
        <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-semibold">🔥 Active Tasks</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Today's tasks, overdue backlog, flexible tasks, and tomorrow's planning
                    </p>
                </div>
                <button
                    onClick={() => openTaskModal()}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    + Add Quest
                </button>
            </div>

            {/* Backlog */}
            <Section title="⏰ Backlog (Overdue Tasks)" titleColor="text-rose-400">
                {sortedBacklogTasks.length === 0 ? (
                    <p className="text-slate-400 text-sm">No overdue tasks</p>
                ) : (
                    sortedBacklogTasks.map(task => {
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
                                date={today}
                                onToggle={toggleTask}
                                onEdit={openEditModal}
                                onDelete={requestDeleteTask}
                                className="border-rose-700/50 hover:border-rose-600"
                            />
                        );
                    })
                )}
            </Section>

            {/* Dzisiaj */}
            <Section title={`📅 Today (${formatShortDate(today)})`} titleColor="text-indigo-400">
                {sortedTodayTasks.length === 0 ? (
                    <p className="text-slate-400 text-sm">No tasks for today</p>
                ) : (
                    sortedTodayTasks.map(task => {
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
                                date={today}
                                onToggle={toggleTask}
                                onEdit={openEditModal}
                                onDelete={requestDeleteTask}
                            />
                        );
                    })
                )}
            </Section>

            {/* Jutro */}
            <Section title={`🌅 Tomorrow (${formatShortDate(tomorrow)})`} titleColor="text-purple-400">
                {sortedTomorrowTasks.length === 0 ? (
                    <p className="text-slate-400 text-sm">No tasks scheduled for tomorrow</p>
                ) : (
                    sortedTomorrowTasks.map(task => {
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
                                onToggle={toggleTask}
                                onEdit={openEditModal}
                                className="opacity-75"
                            />
                        );
                    })
                )}
            </Section>

            {/* Bez terminu */}
            <Section title="📋 No Due Date (Flexible Tasks)" titleColor="text-slate-400">
                {sortedNoDueDateTasks.length === 0 ? (
                    <p className="text-slate-400 text-sm">No tasks without due date</p>
                ) : (
                    sortedNoDueDateTasks.map(task => {
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
                                date={today}
                                onToggle={toggleTask}
                                onEdit={openEditModal}
                                onDelete={requestDeleteTask}
                            />
                        );
                    })
                )}
            </Section>
        </div>
    );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function Section({
    title,
    titleColor,
    children,
}: {
    title: string;
    titleColor: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-3 ${titleColor}`}>{title}</h3>
            <div className="space-y-3">{children}</div>
        </div>
    );
}