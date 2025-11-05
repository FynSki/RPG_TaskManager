import React from 'react';
import type { Project, Task } from '../refactored-src/types';

interface ProjectCardProps {
    project: Project;
    tasks: Task[];
    onViewDetails: (project: Project) => void;
    onDelete: (projectId: string) => void;
}

export function ProjectCard({ project, tasks, onViewDetails, onDelete }: ProjectCardProps) {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const completedTasks = projectTasks.filter(t => t.completed).length;
    const activeTasks = projectTasks.length - completedTasks;
    const completionPercentage = projectTasks.length > 0
        ? Math.round((completedTasks / projectTasks.length) * 100)
        : 0;

    return (
        <div
            className="bg-slate-900 rounded-lg p-6 border-l-4 border border-slate-700 hover:border-slate-600 transition"
            style={{ borderLeftColor: project.color }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3
                        className="text-xl font-semibold"
                        style={{ color: project.color }}
                    >
                        {project.name}
                    </h3>
                    <p className="text-sm text-slate-300 mt-1">
                        {project.description}
                    </p>
                </div>
                <button
                    onClick={() => onDelete(project.id)}
                    className="text-rose-500 hover:text-rose-400 transition"
                    title="Delete project"
                >
                    ✕
                </button>
            </div>

            {/* Stats */}
            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-slate-300">
                    <span>Total Quests:</span>
                    <span className="text-slate-100 font-medium">{projectTasks.length}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-300">
                    <span>Completed:</span>
                    <span className="text-green-400 font-medium">{completedTasks}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-300">
                    <span>Active:</span>
                    <span className="text-indigo-400 font-medium">{activeTasks}</span>
                </div>

                {/* Progress Bar */}
                {projectTasks.length > 0 && (
                    <div className="mt-3">
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                            <div
                                className="h-full transition-all duration-500"
                                style={{
                                    width: `${completionPercentage}%`,
                                    background: project.color,
                                }}
                            />
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-1">
                            {completionPercentage}% Complete
                        </p>
                    </div>
                )}
            </div>

            {/* Recent Quests Preview */}
            <div className="pt-4 border-t border-slate-700">
                <h4 className="text-sm font-semibold mb-2 text-slate-300">
                    Recent Quests
                </h4>
                <div className="space-y-1 mb-3">
                    {projectTasks.slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-center gap-2">
                            <span
                                className={`w-2 h-2 rounded-full ${task.completed ? 'bg-indigo-600' : 'bg-slate-600'
                                    }`}
                            />
                            <span
                                className={`text-xs ${task.completed
                                        ? 'line-through text-slate-500'
                                        : 'text-slate-300'
                                    }`}
                            >
                                {task.name}
                            </span>
                        </div>
                    ))}
                    {projectTasks.length > 3 && (
                        <p className="text-xs text-slate-400 pl-4">
                            +{projectTasks.length - 3} more...
                        </p>
                    )}
                    {projectTasks.length === 0 && (
                        <p className="text-xs text-slate-500 italic">
                            No quests yet
                        </p>
                    )}
                </div>

                {/* View All Button */}
                <button
                    onClick={() => onViewDetails(project)}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm font-medium"
                >
                    View All Quests →
                </button>
            </div>
        </div>
    );
}