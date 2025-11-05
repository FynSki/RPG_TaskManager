import React from 'react';
import type { Project, Task, TaskClass, Skill } from '../refactored-src/types';
import { sortTasks } from '../refactored-src/utils/taskUtils';
import { formatShortDate } from '../refactored-src/utils/dateUtils';

// Import RarityBadge helper
function getRarityColor(rarity: string) {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
        common: { bg: "bg-slate-700", text: "text-slate-300", border: "border-slate-600" },
        rare: { bg: "bg-blue-900", text: "text-blue-300", border: "border-blue-700" },
        epic: { bg: "bg-purple-900", text: "text-purple-300", border: "border-purple-700" },
        legendary: { bg: "bg-orange-900", text: "text-orange-300", border: "border-orange-700" },
        unique: { bg: "bg-yellow-900", text: "text-yellow-300", border: "border-yellow-700" }
    };
    return colorMap[rarity] || colorMap.common;
}

function RarityBadge({ rarity }: { rarity: string }) {
    const colors = getRarityColor(rarity);
    const displayName = rarity.charAt(0).toUpperCase() + rarity.slice(1);

    return (
        <span className={`text-xs px-3 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
            {displayName}
        </span>
    );
}

interface ProjectDetailsProps {
    project: Project;
    tasks: Task[];
    taskClasses: TaskClass[];
    skills: Skill[];
    onBack: () => void;
    onAddQuest: (projectId: string) => void;
    onEditTask: (task: Task) => void;
    onToggleTask: (taskId: string) => void;
}

export function ProjectDetails({
    project,
    tasks,
    taskClasses,
    skills,
    onBack,
    onAddQuest,
    onEditTask,
    onToggleTask,
}: ProjectDetailsProps) {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const sortedProjectTasks = sortTasks(projectTasks);
    const completedTasks = projectTasks.filter(t => t.completed);
    const activeTasks = projectTasks.filter(t => !t.completed);
    const totalXP = projectTasks.reduce((sum, t) => sum + (t.completed ? t.xpReward : 0), 0);

    return (
        <div className="fixed inset-0 bg-slate-900 z-40 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {/* Header with Back Button */}
                <div className="mb-6">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-4"
                    >
                        <span className="text-xl">←</span>
                        <span>Back to Projects</span>
                    </button>

                    {/* Project Header */}
                    <div
                        className="bg-slate-800 rounded-xl p-6 border-l-4 border border-slate-700"
                        style={{ borderLeftColor: project.color }}
                    >
                        <h1
                            className="text-3xl font-bold mb-2"
                            style={{ color: project.color }}
                        >
                            {project.name}
                        </h1>
                        <p className="text-slate-300 mb-4">{project.description}</p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                                <div className="text-2xl font-bold text-slate-100">
                                    {projectTasks.length}
                                </div>
                                <div className="text-sm text-slate-400">Total Quests</div>
                            </div>
                            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                                <div className="text-2xl font-bold text-indigo-400">
                                    {activeTasks.length}
                                </div>
                                <div className="text-sm text-slate-400">Active</div>
                            </div>
                            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                                <div className="text-2xl font-bold text-green-400">
                                    {completedTasks.length}
                                </div>
                                <div className="text-sm text-slate-400">Completed</div>
                            </div>
                            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                                <div className="text-2xl font-bold text-yellow-400">
                                    {totalXP}
                                </div>
                                <div className="text-sm text-slate-400">XP Earned</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">All Quests</h2>
                        <button
                            onClick={() => onAddQuest(project.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            + Add Quest
                        </button>
                    </div>

                    {/* Empty State */}
                    {sortedProjectTasks.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p className="text-lg mb-2">No quests in this project yet</p>
                            <p className="text-sm">
                                Click "Add Quest" to create your first quest!
                            </p>
                        </div>
                    ) : (
                        /* Tasks List */
                        <div className="space-y-3">
                            {sortedProjectTasks.map(task => {
                                const taskClass = task.classId
                                    ? taskClasses.find(c => c.id === task.classId)
                                    : null;
                                const skill = task.skillId
                                    ? skills.find(s => s.id === task.skillId)
                                    : null;

                                return (
                                    <div
                                        key={task.id}
                                        onClick={(e) => {
                                            if ((e.target as HTMLElement).tagName !== 'INPUT') {
                                                onEditTask(task);
                                            }
                                        }}
                                        className={`bg-slate-900 rounded-lg p-4 border border-slate-700 cursor-pointer hover:border-slate-600 transition ${task.completed ? 'opacity-60' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={task.completed}
                                                onChange={() => onToggleTask(task.id)}
                                                className="mt-1 w-5 h-5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                            />

                                            {/* Task Content */}
                                            <div className="flex-1">
                                                <h3
                                                    className={`text-lg font-semibold ${task.completed
                                                            ? 'line-through text-slate-500'
                                                            : ''
                                                        }`}
                                                >
                                                    {task.name}
                                                </h3>
                                                {task.description && (
                                                    <p className="text-sm text-slate-400 mt-1">
                                                        {task.description}
                                                    </p>
                                                )}

                                                {/* Badges */}
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    <span className="text-xs px-3 py-1 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">
                                                        {task.xpReward} XP
                                                    </span>
                                                    {task.priority && (
                                                        <RarityBadge rarity={task.priority} />
                                                    )}
                                                    {task.dueDate && (
                                                        <span className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                                                            📅 {formatShortDate(task.dueDate)}
                                                        </span>
                                                    )}
                                                    {task.isFlexible && (
                                                        <span className="text-xs px-3 py-1 rounded-full bg-teal-900 text-teal-300 border border-teal-700">
                                                            🕐 Flexible
                                                        </span>
                                                    )}
                                                    {task.isRecurring && (
                                                        <span className="text-xs px-3 py-1 rounded-full bg-purple-900 text-purple-300 border border-purple-700">
                                                            🔄 {task.recurringType}
                                                        </span>
                                                    )}
                                                    {taskClass && (
                                                        <span
                                                            className="text-xs px-3 py-1 rounded-full border"
                                                            style={{
                                                                borderColor: taskClass.color,
                                                                color: taskClass.color,
                                                                backgroundColor: `${taskClass.color}20`,
                                                            }}
                                                        >
                                                            {taskClass.name}
                                                        </span>
                                                    )}
                                                    {skill && (
                                                        <span
                                                            className="text-xs px-3 py-1 rounded-full border"
                                                            style={{
                                                                borderColor: skill.color,
                                                                color: skill.color,
                                                                backgroundColor: `${skill.color}20`,
                                                            }}
                                                        >
                                                            {skill.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}