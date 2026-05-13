/**
 * TaskModal — modal tworzenia i edycji zadania
 * Wyciągnięty z App.tsx
 */

import { useAppContext } from "../context/AppContext";
import { getRarityXP, getRarityGold } from "../utils";
import { formatFullDateTime } from "../utils";

export function TaskModal() {
    const {
        showTaskModal, editingTask,
        taskForm, setTaskForm,
        newCommentText, setNewCommentText,
        projects, taskClasses, skills,
        isPremium, today,
        saveTask, closeTaskModal,
        addCommentToTask,
    } = useAppContext();

    if (!showTaskModal) return null;

    const {
        taskName, taskDescription, taskPriority, taskDueDate,
        taskProjectId, taskIsRecurring, taskRecurringType,
        taskRecurringDay, taskRecurringEndDate, taskClassId,
        taskSkillId, taskIsFlexible,
    } = taskForm;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700 my-8 max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-semibold mb-6">
                    {editingTask ? "Edit Quest" : "Create New Quest"}
                </h3>

                <div className="space-y-4">
                    {/* Nazwa */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Quest Name</label>
                        <input
                            type="text"
                            value={taskName}
                            onChange={(e) => setTaskForm({ taskName: e.target.value })}
                            placeholder="Enter quest name..."
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                        />
                    </div>

                    {/* Opis */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={taskDescription}
                            onChange={(e) => setTaskForm({ taskDescription: e.target.value })}
                            placeholder="Quest details..."
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                        />
                    </div>

                    {/* Komentarze */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-400">Comments</label>
                        {editingTask && editingTask.comments && editingTask.comments.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {editingTask.comments.map((comment) => (
                                    <div key={comment.id} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm">
                                        <div className="text-slate-300 break-words">{comment.text}</div>
                                        <div className="mt-1 text-xs text-slate-500">{formatFullDateTime(comment.createdAt)}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500">
                                {editingTask ? "No comments yet — add one below." : "Comments will be available after creating this quest."}
                            </p>
                        )}
                        {editingTask && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm"
                                />
                                <button
                                    onClick={() => addCommentToTask(editingTask.id)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg"
                                >
                                    Add
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Rzadkość */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Rarity</label>
                        <select
                            value={taskPriority}
                            onChange={(e) => setTaskForm({ taskPriority: e.target.value as typeof taskPriority })}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                        >
                            <option value="common">⚪ Common (50 XP)</option>
                            <option value="rare">🔵 Rare (100 XP)</option>
                            <option value="epic">🟣 Epic (250 XP)</option>
                            <option value="legendary">🟠 Legendary (500 XP)</option>
                            <option value="unique">🟡 Unique (1000 XP)</option>
                        </select>
                        <div className="flex gap-4 mt-2 text-xs">
                            <span className="text-slate-400">Rewards:</span>
                            <span className="text-indigo-400 font-semibold">✨ {getRarityXP(taskPriority)} XP</span>
                            <span className="text-yellow-400 font-semibold">🪙 {getRarityGold(taskPriority)} Gold</span>
                        </div>
                    </div>

                    {/* Flexible task */}
                    <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-lg border border-slate-700">
                        <input
                            type="checkbox"
                            id="flexibleTask"
                            checked={taskIsFlexible}
                            onChange={(e) => setTaskForm({ taskIsFlexible: e.target.checked })}
                            className="w-5 h-5 rounded border-slate-600 text-teal-600 focus:ring-teal-500"
                        />
                        <label htmlFor="flexibleTask" className="text-sm font-medium cursor-pointer">
                            🕐 Flexible Task (no due date) — due date set when completed
                        </label>
                    </div>

                    {/* Due date */}
                    {!taskIsFlexible && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Due Date</label>
                            <input
                                type="date"
                                value={taskDueDate}
                                onChange={(e) => setTaskForm({ taskDueDate: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                            />
                        </div>
                    )}

                    {/* Project */}
                    {isPremium && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Project (Optional)</label>
                            <select
                                value={taskProjectId}
                                onChange={(e) => setTaskForm({ taskProjectId: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                            >
                                <option value="">No Project</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Task Class */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Task Class (Optional)</label>
                        <select
                            value={taskClassId}
                            onChange={(e) => setTaskForm({ taskClassId: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                        >
                            <option value="">No Class</option>
                            {taskClasses.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.statType})</option>
                            ))}
                        </select>
                    </div>

                    {/* Skill */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Skill (Optional)</label>
                        <select
                            value={taskSkillId}
                            onChange={(e) => setTaskForm({ taskSkillId: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                        >
                            <option value="">No Skill</option>
                            {skills.map(s => (
                                <option key={s.id} value={s.id}>{s.name} (Lvl {s.level})</option>
                            ))}
                        </select>
                    </div>

                    {/* Recurring */}
                    <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-lg border border-slate-700">
                        <input
                            type="checkbox"
                            id="recurringTask"
                            checked={taskIsRecurring}
                            onChange={(e) => setTaskForm({ taskIsRecurring: e.target.checked })}
                            className="w-5 h-5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="recurringTask" className="text-sm font-medium cursor-pointer">
                            🔄 Recurring Task
                        </label>
                    </div>

                    {taskIsRecurring && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-8">
                            <div>
                                <label className="block text-sm font-medium mb-2">Frequency</label>
                                <select
                                    value={taskRecurringType}
                                    onChange={(e) => setTaskForm({ taskRecurringType: e.target.value as typeof taskRecurringType })}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>

                            {taskRecurringType !== "daily" && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        {taskRecurringType === "weekly" ? "Day of Week" : "Day of Month"}
                                    </label>
                                    <input
                                        type="number"
                                        value={taskRecurringDay}
                                        onChange={(e) => setTaskForm({ taskRecurringDay: Number(e.target.value) })}
                                        min={1}
                                        max={taskRecurringType === "weekly" ? 7 : 31}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                    />
                                </div>
                            )}

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium mb-2">
                                    End Date (Optional) — leave empty for infinite recurring
                                </label>
                                <input
                                    type="date"
                                    value={taskRecurringEndDate}
                                    onChange={(e) => setTaskForm({ taskRecurringEndDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                    min={taskDueDate || today}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={saveTask}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition"
                    >
                        {editingTask ? "Save Changes" : "Create Quest"}
                    </button>
                    <button
                        onClick={closeTaskModal}
                        className="flex-1 bg-slate-900 text-slate-300 px-6 py-3 rounded-lg hover:bg-slate-700 transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}