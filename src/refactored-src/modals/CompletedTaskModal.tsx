/**
 * CompletedTaskModal — modal podglądu ukończonego zadania
 * Wyciągnięty z App.tsx
 */

import { useAppContext } from "../context/AppContext";
import { RarityBadge } from "../components/RarityBadge";
import { formatShortDate, formatFullDateTime } from "../utils";

export function CompletedTaskModal() {
    const {
        showCompletedTaskModal, viewingTask,
        projects, taskClasses, skills,
        closeCompletedTaskModal, toggleTask,
        newCommentText, setNewCommentText,
        addCommentToTask,
    } = useAppContext();

    if (!showCompletedTaskModal || !viewingTask) return null;

    const project = viewingTask.projectId ? projects.find(p => p.id === viewingTask.projectId) : null;
    const taskClass = viewingTask.classId ? taskClasses.find(c => c.id === viewingTask.classId) : null;
    const skill = viewingTask.skillId ? skills.find(s => s.id === viewingTask.skillId) : null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700 my-8">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-semibold">✅ Completed Quest</h3>
                    <button
                        onClick={closeCompletedTaskModal}
                        className="text-slate-400 hover:text-slate-200 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Quest Name</label>
                        <p className="text-xl font-semibold text-slate-100">{viewingTask.name}</p>
                    </div>

                    {viewingTask.description && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                            <p className="text-slate-300 bg-slate-900 p-4 rounded-lg border border-slate-700">
                                {viewingTask.description}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Rarity</label>
                            <RarityBadge rarity={viewingTask.priority} showXP xp={viewingTask.xpReward} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Rewards Earned</label>
                            <div className="flex gap-2">
                                <span className="inline-block px-3 py-1 rounded-lg text-sm bg-indigo-900 text-indigo-300 border border-indigo-700">
                                    ✨ {viewingTask.xpReward} XP
                                </span>
                                <span className="inline-block px-3 py-1 rounded-lg text-sm bg-yellow-900 text-yellow-300 border border-yellow-700">
                                    🪙 {viewingTask.goldReward}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Due Date</label>
                            <p className="text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-700">
                                {viewingTask.dueDate ? formatShortDate(viewingTask.dueDate) : "No due date"}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Completed At</label>
                            <p className="text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-700">
                                {viewingTask.completedAt ? formatFullDateTime(viewingTask.completedAt) : "Unknown"}
                            </p>
                        </div>
                    </div>

                    {project && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Project</label>
                            <span
                                className="inline-block px-4 py-2 rounded-lg text-sm border"
                                style={{ borderColor: project.color, color: project.color, backgroundColor: `${project.color}20` }}
                            >
                                {project.name}
                            </span>
                        </div>
                    )}

                    {taskClass && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Task Class</label>
                            <span
                                className="inline-block px-4 py-2 rounded-lg text-sm border"
                                style={{ borderColor: taskClass.color, color: taskClass.color, backgroundColor: `${taskClass.color}20` }}
                            >
                                {taskClass.name} ({taskClass.statType})
                            </span>
                        </div>
                    )}

                    {skill && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Skill</label>
                            <span
                                className="inline-block px-4 py-2 rounded-lg text-sm border"
                                style={{ borderColor: skill.color, color: skill.color, backgroundColor: `${skill.color}20` }}
                            >
                                {skill.name}
                            </span>
                        </div>
                    )}

                    {viewingTask.isRecurring && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Recurring</label>
                            <span className="inline-block px-4 py-2 rounded-lg text-sm bg-purple-900 text-purple-300 border border-purple-700">
                                🔄 {viewingTask.recurringType}
                                {viewingTask.recurringEndDate && ` (ends: ${formatShortDate(viewingTask.recurringEndDate)})`}
                            </span>
                        </div>
                    )}

                    {/* Komentarze */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Comments</label>
                        {viewingTask.comments && viewingTask.comments.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
                                {viewingTask.comments.map(comment => (
                                    <div key={comment.id} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm">
                                        <div className="text-slate-300">{comment.text}</div>
                                        <div className="text-xs text-slate-500 mt-1">{formatFullDateTime(comment.createdAt)}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 mb-2">No comments yet.</p>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm"
                            />
                            <button
                                onClick={() => addCommentToTask(viewingTask.id)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => { toggleTask(viewingTask.id); closeCompletedTaskModal(); }}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition"
                    >
                        ↩ Mark as Active
                    </button>
                    <button
                        onClick={closeCompletedTaskModal}
                        className="flex-1 bg-slate-900 text-slate-300 px-6 py-3 rounded-lg hover:bg-slate-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}