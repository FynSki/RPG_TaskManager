import React, { useState } from 'react';
import type { Project, Task, Skill, TaskClass } from '../refactored-src/types';
import { ProjectCard } from './ProjectCard';

// ProgressBar helper component
function ProgressBar({ value, max }: { value: number; max: number }) {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
            <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}

interface ProjectsListProps {
    projects: Project[];
    tasks: Task[];
    skills: Skill[];
    taskClasses: TaskClass[];

    // Project management
    newProjectName: string;
    newProjectDesc: string;
    setNewProjectName: (value: string) => void;
    setNewProjectDesc: (value: string) => void;
    onAddProject: () => void;
    onDeleteProject: (projectId: string) => void;
    onViewProjectDetails: (project: Project) => void;

    // Skills management
    newSkillName: string;
    setNewSkillName: (value: string) => void;
    onAddSkill: () => void;
    onDeleteSkill: (skillId: string) => void;

    // Task Classes management
    newClassName: string;
    newClassStat: "strength" | "endurance" | "intelligence" | "agility" | "charisma";
    setNewClassName: (value: string) => void;
    setNewClassStat: (value: "strength" | "endurance" | "intelligence" | "agility" | "charisma") => void;
    onAddTaskClass: () => void;
    onDeleteTaskClass: (classId: string) => void;
}

export function ProjectsList({
    projects,
    tasks,
    skills,
    taskClasses,
    newProjectName,
    newProjectDesc,
    setNewProjectName,
    setNewProjectDesc,
    onAddProject,
    onDeleteProject,
    onViewProjectDetails,
    newSkillName,
    setNewSkillName,
    onAddSkill,
    onDeleteSkill,
    newClassName,
    newClassStat,
    setNewClassName,
    setNewClassStat,
    onAddTaskClass,
    onDeleteTaskClass,
}: ProjectsListProps) {
    const [isSkillPanelOpen, setIsSkillPanelOpen] = useState(false);
    const [isTaskClassPanelOpen, setIsTaskClassPanelOpen] = useState(false);

    return (
        <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Projects & Classes</h2>

            {/* Create New Project Form */}
            <div className="bg-slate-900 rounded-lg p-4 mb-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-3">Create New Project</h3>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Project name"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        onClick={onAddProject}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition font-medium"
                    >
                        Create Project
                    </button>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {projects.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-400">
                        <p className="text-lg mb-2">No projects yet</p>
                        <p className="text-sm">Create your first project above!</p>
                    </div>
                ) : (
                    projects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            tasks={tasks}
                            onViewDetails={onViewProjectDetails}
                            onDelete={onDeleteProject}
                        />
                    ))
                )}
            </div>

            {/* Skills Management - Collapsible */}
            <div className="bg-slate-900 rounded-lg border border-slate-700 mt-6 overflow-hidden">
                <button
                    onClick={() => setIsSkillPanelOpen(!isSkillPanelOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-900 hover:bg-slate-800 transition-colors text-left"
                >
                    <h3 className="text-lg font-semibold text-slate-100">
                        Skills Management
                    </h3>
                    <span className="text-xl text-indigo-400">
                        {isSkillPanelOpen ? '▼' : '▶'}
                    </span>
                </button>

                {isSkillPanelOpen && (
                    <div className="p-4 border-t border-slate-700">
                        <p className="text-sm text-slate-400 mb-4">
                            Create custom skills to track your personal growth. Assign skills to
                            tasks to level them up!
                        </p>

                        <div className="flex gap-3 mb-4">
                            <input
                                type="text"
                                placeholder="Skill name (e.g. Cooking, Guitar)"
                                value={newSkillName}
                                onChange={(e) => setNewSkillName(e.target.value)}
                                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                onClick={onAddSkill}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                            >
                                Add Skill
                            </button>
                        </div>

                        <div className="space-y-3">
                            {skills.length > 0 ? (
                                skills.map(skill => (
                                    <div
                                        key={skill.id}
                                        className="bg-slate-800 rounded-lg p-4 border border-slate-700"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                                                    style={{ background: skill.color }}
                                                >
                                                    {skill.name[0]}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-100">
                                                        {skill.name}
                                                    </h4>
                                                    <p className="text-xs text-slate-400">
                                                        Level {skill.level}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onDeleteSkill(skill.id)}
                                                className="text-rose-500 hover:text-rose-400 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">
                                                Progress to next level
                                            </p>
                                            <ProgressBar
                                                value={skill.progress}
                                                max={skill.level + 1}
                                            />
                                            <p className="text-xs text-slate-400 mt-1">
                                                {skill.progress}/{skill.level + 1} tasks completed
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-sm">
                                    No skills yet — add one to start tracking your personal growth.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Task Classes - Collapsible */}
            <div className="bg-slate-900 rounded-lg border border-slate-700 mt-6 overflow-hidden">
                <button
                    onClick={() => setIsTaskClassPanelOpen(!isTaskClassPanelOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-900 hover:bg-slate-800 transition-colors text-left"
                >
                    <h3 className="text-lg font-semibold text-slate-100">
                        Task Classes (map to stats)
                    </h3>
                    <span className="text-xl text-indigo-400">
                        {isTaskClassPanelOpen ? '▼' : '▶'}
                    </span>
                </button>

                {isTaskClassPanelOpen && (
                    <div className="p-4 border-t border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Class name (e.g. Running)"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <select
                                value={newClassStat}
                                onChange={(e) =>
                                    setNewClassStat(
                                        e.target.value as
                                        | "strength"
                                        | "endurance"
                                        | "intelligence"
                                        | "agility"
                                        | "charisma"
                                    )
                                }
                                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="strength">Strength</option>
                                <option value="endurance">Endurance</option>
                                <option value="intelligence">Intelligence</option>
                                <option value="agility">Agility</option>
                                <option value="charisma">Charisma</option>
                            </select>
                            <button
                                onClick={onAddTaskClass}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                            >
                                Add Class
                            </button>
                        </div>

                        <div className="space-y-2">
                            {taskClasses.length > 0 ? (
                                taskClasses.map(taskClass => (
                                    <div
                                        key={taskClass.id}
                                        className="flex items-center justify-between bg-slate-800 p-3 rounded border border-slate-700"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                                style={{ background: taskClass.color }}
                                            >
                                                {taskClass.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-100">
                                                    {taskClass.name}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {taskClass.statType}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onDeleteTaskClass(taskClass.id)}
                                            className="text-rose-500 hover:text-rose-400 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-sm">
                                    No task classes yet — add one to map tasks to stats!
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}