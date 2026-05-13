/**
 * TaskCard — karta zadania używana we wszystkich widokach
 * Eliminuje ~600 linii zduplikowanego JSX z App.tsx
 */

import type { Task, Project, TaskClass, Skill, RecurringTaskCompletion } from "../types";
import { isTaskCompletedOnDate } from "../utils";
import { RarityBadge } from "./RarityBadge";

// ─── TaskTagsRow ──────────────────────────────────────────────────────────────

type TaskTagsRowProps = {
    task: Task;
    project?: Project | null;
    taskClass?: TaskClass | null;
    skill?: Skill | null;
    showDueDate?: boolean;
};

export function TaskTagsRow({ task, project, taskClass, skill, showDueDate = false }: TaskTagsRowProps) {
    return (
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <span className="px-2 sm:px-3 py-1 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">
                {task.xpReward} XP
            </span>

            {task.goldReward !== undefined && (
                <span className="px-2 sm:px-3 py-1 rounded-full bg-yellow-900 text-yellow-300 border border-yellow-700">
                    🪙 {task.goldReward}
                </span>
            )}

            {task.priority && <RarityBadge rarity={task.priority} />}

            {showDueDate && task.dueDate && (
                <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                    📅 {task.dueDate}
                </span>
            )}

            {task.isFlexible && (
                <span className="px-3 py-1 rounded-full bg-teal-900 text-teal-300 border border-teal-700">
                    🕐 Flexible
                </span>
            )}

            {!task.dueDate && !task.isFlexible && !task.isRecurring && (
                <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                    📋 No deadline
                </span>
            )}

            {project && (
                <span
                    className="px-2 sm:px-3 py-1 rounded-full border"
                    style={{
                        borderColor: project.color,
                        color: project.color,
                        backgroundColor: `${project.color}20`,
                    }}
                >
                    📁 {project.name}
                </span>
            )}

            {taskClass && (
                <span
                    className="px-2 sm:px-3 py-1 rounded-full border"
                    style={{
                        borderColor: taskClass.color,
                        color: taskClass.color,
                        backgroundColor: `${taskClass.color}20`,
                    }}
                >
                    ⚔️ {taskClass.name}
                </span>
            )}

            {skill && (
                <span
                    className="px-2 sm:px-3 py-1 rounded-full border"
                    style={{
                        borderColor: skill.color,
                        color: skill.color,
                        backgroundColor: `${skill.color}20`,
                    }}
                >
                    ✨ {skill.name}
                </span>
            )}

            {task.isRecurring && (
                <span className="px-2 sm:px-3 py-1 rounded-full bg-purple-900 text-purple-300 border border-purple-700">
                    🔄 {task.recurringType}
                </span>
            )}
        </div>
    );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

type TaskCardProps = {
    task: Task;
    project?: Project | null;
    taskClass?: TaskClass | null;
    skill?: Skill | null;
    recurringCompletions?: RecurringTaskCompletion[];
    /** Data do sprawdzenia ukończenia recurring task i przekazania do toggle */
    date?: string;
    onToggle: (taskId: string, date?: string) => void;
    onEdit?: (task: Task) => void;
    /** Wywołuje requestDeleteTask — otwiera modal potwierdzenia */
    onDelete?: (taskId: string) => void;
    showDueDate?: boolean;
    className?: string;
};

export function TaskCard({
    task,
    project,
    taskClass,
    skill,
    recurringCompletions = [],
    date,
    onToggle,
    onEdit,
    onDelete,
    showDueDate = false,
    className = "",
}: TaskCardProps) {
    const isCompleted = task.isRecurring && date
        ? isTaskCompletedOnDate(task, date, recurringCompletions)
        : task.completed;

    return (
        <div
            className={`bg-slate-900 rounded-lg p-3 sm:p-4 border border-slate-700 transition-all
                ${isCompleted ? "opacity-60" : ""}
                ${className}`}
        >
            <div className="flex items-start gap-3 sm:gap-4">
                <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => onToggle(task.id, date)}
                    className="mt-1 w-5 h-5 sm:w-6 sm:h-6 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className={`text-base sm:text-lg font-semibold break-words ${isCompleted ? "line-through text-slate-500" : ""}`}>
                                {task.name}
                            </h3>

                            {task.description && (
                                <p className="text-xs sm:text-sm text-slate-400 mt-1 break-words">
                                    {task.description}
                                </p>
                            )}

                            <TaskTagsRow
                                task={task}
                                project={project}
                                taskClass={taskClass}
                                skill={skill}
                                showDueDate={showDueDate}
                            />
                        </div>

                        {(onEdit || onDelete) && (
                            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                                {onEdit && (
                                    <button
                                        onClick={() => onEdit(task)}
                                        className="text-slate-400 hover:text-indigo-400 transition p-1 text-lg sm:text-xl"
                                        title="Edit quest"
                                    >
                                        ✏️
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => onDelete(task.id)}
                                        className="text-slate-400 hover:text-rose-400 transition p-1 text-lg sm:text-xl"
                                        title="Delete quest"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({
    message = "No quests for this day",
    hint = 'Click "Add Quest" to create one!',
}: {
    message?: string;
    hint?: string;
}) {
    return (
        <div className="text-center py-12 text-slate-400">
            <p className="text-lg mb-2">{message}</p>
            <p className="text-sm">{hint}</p>
        </div>
    );
}