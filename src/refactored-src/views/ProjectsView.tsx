/**
 * ProjectsView — widok projektów
 * Wyciągnięty z App.tsx
 */

import { useAppContext } from "../context/AppContext";
import { formatShortDate, sortTasks } from "../utils";
import { RarityBadge } from "../components/RarityBadge";

export function ProjectsView() {
    const {
        projects, tasks, taskClasses, skills,
        selectedProject, setSelectedProject,
        showEditProjectModal, editingProject,
        newProjectName, setNewProjectName,
        newProjectDesc, setNewProjectDesc,
        editProjectName, setEditProjectName,
        editProjectDesc, setEditProjectDesc,
        addProject, deleteProject,
        openEditProjectModal, saveProjectEdit,
        toggleTask, openEditModal, openTaskModal,
        setTaskForm,
    } = useAppContext();

    return (
        <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Projects & Classes</h2>

            {/* Formularz nowego projektu */}
            <div className="bg-slate-900 rounded-lg p-4 mb-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-3">Create New Project</h3>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Project name"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                    />
                    <button
                        onClick={addProject}
                        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Create Project
                    </button>
                </div>
            </div>

            {/* Lista projektów */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {projects.map(project => {
                    const projectTasks = tasks.filter(t => t.projectId === project.id);
                    const completedTasks = projectTasks.filter(t => t.completed).length;

                    return (
                        <div
                            key={project.id}
                            className="bg-slate-900 rounded-lg p-6 border-l-4 border border-slate-700"
                            style={{ borderLeftColor: project.color }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold" style={{ color: project.color }}>{project.name}</h3>
                                    <p className="text-sm text-slate-300">{project.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditProjectModal(project)} className="text-indigo-500 hover:text-indigo-400 transition" title="Edit">✏️</button>
                                    <button onClick={() => deleteProject(project.id)} className="text-rose-500 hover:text-rose-400" title="Delete">✕</button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-slate-300 mb-3">
                                <div className="flex justify-between"><span>Total Quests:</span><span>{projectTasks.length}</span></div>
                                <div className="flex justify-between"><span>Completed:</span><span>{completedTasks}</span></div>
                                <div className="flex justify-between"><span>Active:</span><span>{projectTasks.length - completedTasks}</span></div>
                            </div>

                            {projectTasks.length > 0 && (
                                <div className="mb-3">
                                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                                        <div
                                            className="h-full transition-all duration-500"
                                            style={{ width: `${(completedTasks / projectTasks.length) * 100}%`, background: project.color }}
                                        />
                                    </div>
                                    <p className="text-center text-xs text-slate-400 mt-1">
                                        {Math.round((completedTasks / projectTasks.length) * 100)}% Complete
                                    </p>
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <h4 className="text-sm font-semibold mb-2 text-slate-300">Recent Quests</h4>
                                <div className="space-y-1 mb-3">
                                    {projectTasks.slice(0, 3).map(task => (
                                        <div key={task.id} className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${task.completed ? 'bg-indigo-600' : 'bg-slate-600'}`} />
                                            <span className={`text-xs ${task.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>{task.name}</span>
                                        </div>
                                    ))}
                                    {projectTasks.length > 3 && <p className="text-xs text-slate-400">+{projectTasks.length - 3} more...</p>}
                                </div>
                                <button
                                    onClick={() => setSelectedProject(project)}
                                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm font-medium"
                                >
                                    View All Quests →
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edit project modal */}
            {showEditProjectModal && editingProject && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-semibold">Edit Project</h3>
                            <button onClick={() => saveProjectEdit()} className="text-slate-400 hover:text-slate-200 text-2xl">✕</button>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={editProjectName}
                                onChange={(e) => setEditProjectName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                placeholder="Project name"
                            />
                            <textarea
                                value={editProjectDesc}
                                onChange={(e) => setEditProjectDesc(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 resize-none"
                                rows={3}
                                placeholder="Description"
                            />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => saveProjectEdit()}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Project details fullscreen */}
            {selectedProject && (
                <div className="fixed inset-0 bg-slate-900 z-40 overflow-y-auto">
                    <div className="max-w-7xl mx-auto p-4 sm:p-6">
                        <button
                            onClick={() => setSelectedProject(null)}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-4"
                        >
                            <span className="text-xl">←</span>
                            <span>Back to Projects</span>
                        </button>

                        <div className="bg-slate-800 rounded-xl p-6 border-l-4 border border-slate-700 mb-6" style={{ borderLeftColor: selectedProject.color }}>
                            <div className="flex justify-between items-start mb-2">
                                <h1 className="text-3xl font-bold" style={{ color: selectedProject.color }}>{selectedProject.name}</h1>
                                <button
                                    onClick={() => openEditProjectModal(selectedProject)}
                                    className="text-indigo-500 hover:text-indigo-400 transition px-3 py-1 rounded-lg border border-indigo-500 flex items-center gap-2"
                                >
                                    <span>✏️</span><span className="text-sm">Edit Project</span>
                                </button>
                            </div>
                            <p className="text-slate-300 mb-4">{selectedProject.description}</p>

                            {(() => {
                                const projectTasks = tasks.filter(t => t.projectId === selectedProject.id);
                                const completedT = projectTasks.filter(t => t.completed);
                                const activeT = projectTasks.filter(t => !t.completed);
                                const totalXP = projectTasks.reduce((s, t) => s + (t.completed ? t.xpReward : 0), 0);
                                return (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: "Total Quests", value: projectTasks.length, color: "text-slate-100" },
                                            { label: "Active", value: activeT.length, color: "text-indigo-400" },
                                            { label: "Completed", value: completedT.length, color: "text-green-400" },
                                            { label: "XP Earned", value: totalXP, color: "text-yellow-400" },
                                        ].map(s => (
                                            <div key={s.label} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                                                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                                                <div className="text-sm text-slate-400">{s.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold">All Quests</h2>
                                <button
                                    onClick={() => {
                                        setTaskForm({ taskProjectId: selectedProject.id });
                                        openTaskModal();
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                                >
                                    + Add Quest
                                </button>
                            </div>

                            <div className="space-y-3">
                                {(() => {
                                    const projectTasks = sortTasks(tasks.filter(t => t.projectId === selectedProject.id));
                                    if (projectTasks.length === 0) {
                                        return (
                                            <div className="text-center py-12 text-slate-400">
                                                <p className="text-lg mb-2">No quests in this project yet</p>
                                                <p className="text-sm">Click "Add Quest" to create your first quest!</p>
                                            </div>
                                        );
                                    }
                                    return projectTasks.map(task => {
                                        const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;
                                        const skill = task.skillId ? skills.find(s => s.id === task.skillId) : null;
                                        return (
                                            <div
                                                key={task.id}
                                                onClick={(e) => { if ((e.target as HTMLElement).tagName !== 'INPUT') openEditModal(task); }}
                                                className={`bg-slate-900 rounded-lg p-4 border border-slate-700 cursor-pointer hover:border-slate-600 transition ${task.completed ? 'opacity-60' : ''}`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={task.completed}
                                                        onChange={() => toggleTask(task.id)}
                                                        className="mt-1 w-5 h-5 rounded border-slate-600 text-indigo-600"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-slate-500' : ''}`}>{task.name}</h3>
                                                        {task.description && <p className="text-sm text-slate-400 mt-1">{task.description}</p>}
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            <span className="text-xs px-3 py-1 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">{task.xpReward} XP</span>
                                                            <span className="text-xs px-3 py-1 rounded-full bg-yellow-900 text-yellow-300 border border-yellow-700">🪙 {task.goldReward}</span>
                                                            {task.priority && <RarityBadge rarity={task.priority} />}
                                                            {task.dueDate && <span className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600">📅 {formatShortDate(task.dueDate)}</span>}
                                                            {task.isFlexible && <span className="text-xs px-3 py-1 rounded-full bg-teal-900 text-teal-300 border border-teal-700">🕐 Flexible</span>}
                                                            {task.isRecurring && <span className="text-xs px-3 py-1 rounded-full bg-purple-900 text-purple-300 border border-purple-700">🔄 {task.recurringType}</span>}
                                                            {taskClass && <span className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: taskClass.color, color: taskClass.color, backgroundColor: `${taskClass.color}20` }}>{taskClass.name}</span>}
                                                            {skill && <span className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: skill.color, color: skill.color, backgroundColor: `${skill.color}20` }}>{skill.name}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}