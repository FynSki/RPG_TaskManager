
// App.tsx
import React, { useEffect, useState } from "react";

/**
 * Professional-styled Task Quest app (updated)
 * - Pro (steel-blue) theme
 * - Stats: strength / dexterity / intelligence with n+1 progression
 * - Task class mapping to stats
 * - Task name always visible in daily
 * - Improved layout for weekly/monthly task rows (actions aligned naturally)
 *
 * Save this file as App.tsx in your React + Tailwind project.
 */

/* -----------------------------
   Types
   ----------------------------- */
type Project = {
    id: string;
    name: string;
    color: string;
    description: string;
};

type SubTask = {
    id: string;
    name: string;
    completed: boolean;
};

type Task = {
    id: string;
    projectId: string | null;
    name: string;
    description: string;
    completed: boolean;
    xpReward: number;
    priority: "low" | "medium" | "high";
    dueDate: string;
    subtasks: SubTask[];
    createdAt: string;
    isRecurring?: boolean;
    recurringType?: "daily" | "weekly" | "monthly";
    recurringDay?: number;
    statType?: "strength" | "dexterity" | "intelligence" | null;
    classId?: string | null;
};

type Character = {
    name: string;
    level: number;
    xp: number;
    totalXp: number;
    avatar: string;
    strength: number;
    dexterity: number;
    intelligence: number;
    unspentPoints: number;
};

type RecurringTaskCompletion = {
    taskId: string;
    date: string;
    completed: boolean;
};

type TaskClass = {
    id: string;
    name: string;
    statType: "strength" | "dexterity" | "intelligence";
    color?: string;
};

/* -----------------------------
   Constants & helpers
   ----------------------------- */

const AVATARS = ["⚔️", "🛡️", "🏹", "📚", "🧙", "🧠", "🧘"];

function usePersistedState<T>(key: string, defaultValue: T) {
    const [state, setState] = useState<T>(() => {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch {
            // ignore
        }
    }, [key, state]);

    return [state, setState] as const;
}

function calculateXpForLevel(level: number): number {
    return Math.floor(250 * level * (level + 1));
}

function getWeekDates(dateStr: string): string[] {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));

    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(monday);
        currentDate.setDate(monday.getDate() + i);
        dates.push(currentDate.toISOString().slice(0, 10));
    }
    return dates;
}

function getMonthDates(dateStr: string): string[] {
    const [year, month] = dateStr.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const firstDayOfWeek = firstDay.getDay();
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const dates: string[] = [];

    for (let i = 0; i < adjustedFirstDay; i++) {
        dates.push("");
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
        const monthStr = month.toString().padStart(2, "0");
        const dayStr = d.toString().padStart(2, "0");
        dates.push(`${year}-${monthStr}-${dayStr}`);
    }

    return dates;
}

function getDayName(dateStr: string): string {
    const date = new Date(dateStr);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
}

type ProgressBarProps = {
    value: number;
    max: number;
};

function ProgressBar({ value, max }: ProgressBarProps) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
            <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-500 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
    );
}

export default function App() {
    const [character, setCharacter] = usePersistedState<Character>("character", {
        name: "Hero",
        level: 1,
        xp: 0,
        totalXp: 0,
        avatar: AVATARS[0],
        strength: 0,
        dexterity: 0,
        intelligence: 0,
        unspentPoints: 0
    });

    const [tasks, setTasks] = usePersistedState<Task[]>("tasks", []);
    const [projects, setProjects] = usePersistedState<Project[]>("projects", []);
    const [taskClasses, setTaskClasses] = usePersistedState<TaskClass[]>("taskClasses", []);
    const [recurringCompletions, setRecurringCompletions] = usePersistedState<RecurringTaskCompletion[]>("recurringCompletions", []);
    const [statProgress, setStatProgress] = usePersistedState<{ strength: number; dexterity: number; intelligence: number; }>("statProgress", { strength: 0, dexterity: 0, intelligence: 0 });

    const [view, setView] = useState<"daily" | "weekly" | "monthly" | "allTasks" | "settings" | "projects">("daily");
    const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

    const [newTaskName, setNewTaskName] = useState<string>("");
    const [newTaskDesc, setNewTaskDesc] = useState<string>("");
    const [newTaskXp, setNewTaskXp] = useState<string>("10");
    const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
    const [newTaskDate, setNewTaskDate] = useState<string>(currentDate);
    const [newTaskProject, setNewTaskProject] = useState<string | null>(null);
    const [newTaskClass, setNewTaskClass] = useState<string | null>(null);
    const [newTaskRecurring, setNewTaskRecurring] = useState<boolean>(false);
    const [newTaskRecurringType, setNewTaskRecurringType] = useState<"daily" | "weekly" | "monthly">("daily");
    const [newTaskRecurringDay, setNewTaskRecurringDay] = useState<string>("1");

    const [newProjectName, setNewProjectName] = useState<string>("");
    const [newProjectDesc, setNewProjectDesc] = useState<string>("");
    const [newProjectColor, setNewProjectColor] = useState<string>("#3b82f6");
    const [newClassName, setNewClassName] = useState<string>("");
    const [newClassStat, setNewClassStat] = useState<"strength" | "dexterity" | "intelligence">("strength");
    const [newClassColor, setNewClassColor] = useState<string>("#ef4444");

    const today = new Date().toISOString().slice(0, 10);

    function tasksNeededForStat(currentStat: number): number {
        return currentStat + 1;
    }

    function addXp(amount: number) {
        const newTotal = character.totalXp + amount;
        const requiredForNextLevel = calculateXpForLevel(character.level + 1);
        if (newTotal >= requiredForNextLevel) {
            setCharacter(prev => ({
                ...prev,
                xp: newTotal - requiredForNextLevel,
                totalXp: newTotal,
                level: prev.level + 1,
                unspentPoints: prev.unspentPoints + 1
            }));
        } else {
            setCharacter(prev => ({ ...prev, xp: newTotal, totalXp: newTotal }));
        }
    }

    function incrementStatProgress(statType: "strength" | "dexterity" | "intelligence") {
        const needed = tasksNeededForStat(character[statType]);
        const newProgress = statProgress[statType] + 1;

        if (newProgress >= needed) {
            setStatProgress(prev => ({ ...prev, [statType]: 0 }));
            setCharacter(prev => ({ ...prev, [statType]: prev[statType] + 1 }));
        } else {
            setStatProgress(prev => ({ ...prev, [statType]: newProgress }));
        }
    }

    function assignPointToStat(statType: "strength" | "dexterity" | "intelligence") {
        if (character.unspentPoints > 0) {
            setCharacter(prev => ({
                ...prev,
                [statType]: prev[statType] + 1,
                unspentPoints: prev.unspentPoints - 1
            }));
        }
    }

    function addTask() {
        const task: Task = {
            id: Date.now().toString(),
            projectId: newTaskProject,
            name: newTaskName,
            description: newTaskDesc,
            completed: false,
            xpReward: parseInt(newTaskXp) || 10,
            priority: newTaskPriority,
            dueDate: newTaskDate,
            subtasks: [],
            createdAt: new Date().toISOString(),
            isRecurring: newTaskRecurring,
            recurringType: newTaskRecurring ? newTaskRecurringType : undefined,
            recurringDay: newTaskRecurring && newTaskRecurringType !== "daily" ? parseInt(newTaskRecurringDay) : undefined,
            classId: newTaskClass,
            statType: newTaskClass ? taskClasses.find(c => c.id === newTaskClass)?.statType ?? null : null
        };
        setTasks([...tasks, task]);
        resetTaskForm();
        setShowTaskForm(false);
    }

    function updateTask() {
        if (!editingTask) return;
        const updated = tasks.map(t => t.id === editingTask.id ? {
            ...t,
            name: newTaskName,
            description: newTaskDesc,
            xpReward: parseInt(newTaskXp) || 10,
            priority: newTaskPriority,
            dueDate: newTaskDate,
            projectId: newTaskProject,
            classId: newTaskClass,
            statType: newTaskClass ? taskClasses.find(c => c.id === newTaskClass)?.statType ?? null : null,
            isRecurring: newTaskRecurring,
            recurringType: newTaskRecurring ? newTaskRecurringType : undefined,
            recurringDay: newTaskRecurring && newTaskRecurringType !== "daily" ? parseInt(newTaskRecurringDay) : undefined
        } : t);
        setTasks(updated);
        resetTaskForm();
        setEditingTask(null);
        setShowTaskForm(false);
    }

    function resetTaskForm() {
        setNewTaskName("");
        setNewTaskDesc("");
        setNewTaskXp("10");
        setNewTaskPriority("medium");
        setNewTaskDate(currentDate);
        setNewTaskProject(null);
        setNewTaskClass(null);
        setNewTaskRecurring(false);
        setNewTaskRecurringType("daily");
        setNewTaskRecurringDay("1");
    }

    function deleteTask(id: string) {
        setTasks(tasks.filter(t => t.id !== id));
    }

    function toggleTask(task: Task, date: string) {
        if (task.isRecurring) {
            const existing = recurringCompletions.find(c => c.taskId === task.id && c.date === date);
            if (existing) {
                const updated = recurringCompletions.map(c => c.taskId === task.id && c.date === date ? { ...c, completed: !c.completed } : c);
                setRecurringCompletions(updated);
                if (!existing.completed) {
                    addXp(task.xpReward);
                    if (task.statType) incrementStatProgress(task.statType);
                }
            } else {
                setRecurringCompletions([...recurringCompletions, { taskId: task.id, date, completed: true }]);
                addXp(task.xpReward);
                if (task.statType) incrementStatProgress(task.statType);
            }
        } else {
            const updated = tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t);
            setTasks(updated);
            if (!task.completed) {
                addXp(task.xpReward);
                if (task.statType) incrementStatProgress(task.statType);
            }
        }
    }

    function addSubtask(taskId: string, subtaskName: string) {
        const updated = tasks.map(t => t.id === taskId ? { ...t, subtasks: [...t.subtasks, { id: Date.now().toString(), name: subtaskName, completed: false }] } : t);
        setTasks(updated);
    }

    function toggleSubtask(taskId: string, subtaskId: string) {
        const updated = tasks.map(t => {
            if (t.id === taskId) {
                const subs = t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
                return { ...t, subtasks: subs };
            }
            return t;
        });
        setTasks(updated);
    }

    function addProject() {
        if (newProjectName.trim()) {
            const project: Project = {
                id: Date.now().toString(),
                name: newProjectName,
                color: newProjectColor,
                description: newProjectDesc
            };
            setProjects([...projects, project]);
            setNewProjectName("");
            setNewProjectDesc("");
            setNewProjectColor("#3b82f6");
        }
    }

    function deleteProject(id: string) {
        setProjects(projects.filter(p => p.id !== id));
        setTasks(tasks.map(t => t.projectId === id ? { ...t, projectId: null } : t));
    }

    function addTaskClass() {
        if (newClassName.trim()) {
            const taskClass: TaskClass = {
                id: Date.now().toString(),
                name: newClassName,
                statType: newClassStat,
                color: newClassColor
            };
            setTaskClasses([...taskClasses, taskClass]);
            setNewClassName("");
            setNewClassStat("strength");
            setNewClassColor("#ef4444");
        }
    }

    function deleteTaskClass(id: string) {
        setTaskClasses(taskClasses.filter(c => c.id !== id));
        setTasks(tasks.map(t => t.classId === id ? { ...t, classId: null, statType: null } : t));
    }

    function resetProgress() {
        localStorage.clear();
        window.location.reload();
    }

    function isTaskForDate(task: Task, date: string): boolean {
        if (!task.isRecurring) return task.dueDate === date;
        if (task.recurringType === "daily") return true;
        if (task.recurringType === "weekly") {
            const d = new Date(date);
            return d.getDay() === (task.recurringDay ?? 1);
        }
        if (task.recurringType === "monthly") {
            const d = new Date(date);
            return d.getDate() === (task.recurringDay ?? 1);
        }
        return false;
    }

    function isTaskCompleted(task: Task, date: string): boolean {
        if (!task.isRecurring) return task.completed;
        const completion = recurringCompletions.find(c => c.taskId === task.id && c.date === date);
        return completion?.completed ?? false;
    }

    const weekDates = getWeekDates(currentDate);
    const monthDates = getMonthDates(currentDate);

    const dailyTasks = tasks.filter(t => isTaskForDate(t, currentDate));

    const weeklyTasks: Record<string, Task[]> = {};
    weekDates.forEach(d => {
        weeklyTasks[d] = tasks.filter(t => isTaskForDate(t, d));
    });

    const monthlyTasks: Record<string, Task[]> = {};
    monthDates.forEach(d => {
        if (d) monthlyTasks[d] = tasks.filter(t => isTaskForDate(t, d));
    });

    function openEditTask(task: Task) {
        setEditingTask(task);
        setNewTaskName(task.name);
        setNewTaskDesc(task.description);
        setNewTaskXp(task.xpReward.toString());
        setNewTaskPriority(task.priority);
        setNewTaskDate(task.dueDate);
        setNewTaskProject(task.projectId);
        setNewTaskClass(task.classId ?? null);
        setNewTaskRecurring(task.isRecurring ?? false);
        setNewTaskRecurringType(task.recurringType ?? "daily");
        setNewTaskRecurringDay((task.recurringDay ?? 1).toString());
        setShowTaskForm(true);
    }

    const requiredForNextLevel = calculateXpForLevel(character.level + 1);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-gradient-to-br from-indigo-900 to-slate-800 rounded-xl shadow-2xl p-6 mb-8 border border-indigo-700">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="text-6xl">{character.avatar}</div>
                            <div>
                                <h1 className="text-3xl font-bold">{character.name}</h1>
                                <p className="text-indigo-200">Level {character.level} Hero</p>
                            </div>
                        </div>

                        <div className="w-full md:w-auto">
                            <p className="text-sm text-indigo-200 mb-2">XP: {character.xp} / {requiredForNextLevel}</p>
                            <ProgressBar value={character.xp} max={requiredForNextLevel} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    <button onClick={() => setView("settings")} className={`px-6 py-3 rounded-lg font-medium transition-colors ${view === "settings" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>Character</button>
                    <button onClick={() => setView("daily")} className={`px-6 py-3 rounded-lg font-medium transition-colors ${view === "daily" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>Daily</button>
                    <button onClick={() => setView("weekly")} className={`px-6 py-3 rounded-lg font-medium transition-colors ${view === "weekly" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>Weekly</button>
                    <button onClick={() => setView("monthly")} className={`px-6 py-3 rounded-lg font-medium transition-colors ${view === "monthly" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>Monthly</button>
                    <button onClick={() => setView("allTasks")} className={`px-6 py-3 rounded-lg font-medium transition-colors ${view === "allTasks" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>All Quests</button>
                    <button onClick={() => setView("projects")} className={`px-6 py-3 rounded-lg font-medium transition-colors ${view === "projects" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>Projects</button>
                </div>

                {showTaskForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-semibold">{editingTask ? "Edit Quest" : "Create New Quest"}</h3>
                                <button onClick={() => { setShowTaskForm(false); setEditingTask(null); resetTaskForm(); }} className="text-slate-400 hover:text-slate-200 text-2xl">✕</button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-300">Quest Name</label>
                                    <input type="text" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-300">Description</label>
                                    <textarea value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100" rows={3} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-slate-300">XP Reward</label>
                                        <input type="number" value={newTaskXp} onChange={(e) => setNewTaskXp(e.target.value)} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-slate-300">Priority</label>
                                        <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as "low" | "medium" | "high")} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100">
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-300">Due Date</label>
                                    <input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-300">Project</label>
                                    <select value={newTaskProject ?? ""} onChange={(e) => setNewTaskProject(e.target.value || null)} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100">
                                        <option value="">None</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-300">Task Class (for auto-stat progress)</label>
                                    <select value={newTaskClass ?? ""} onChange={(e) => setNewTaskClass(e.target.value || null)} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100">
                                        <option value="">None</option>
                                        {taskClasses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.statType})</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={newTaskRecurring} onChange={(e) => setNewTaskRecurring(e.target.checked)} className="w-5 h-5" />
                                        <span className="text-sm font-medium text-slate-300">Recurring Task</span>
                                    </label>
                                </div>

                                {newTaskRecurring && (
                                    <div className="space-y-3 pl-7 border-l-2 border-indigo-600">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-slate-300">Frequency</label>
                                            <select value={newTaskRecurringType} onChange={(e) => setNewTaskRecurringType(e.target.value as "daily" | "weekly" | "monthly")} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100">
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                        </div>

                                        {newTaskRecurringType === "weekly" && (
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-slate-300">Day of Week</label>
                                                <select value={newTaskRecurringDay} onChange={(e) => setNewTaskRecurringDay(e.target.value)} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100">
                                                    <option value="0">Sunday</option>
                                                    <option value="1">Monday</option>
                                                    <option value="2">Tuesday</option>
                                                    <option value="3">Wednesday</option>
                                                    <option value="4">Thursday</option>
                                                    <option value="5">Friday</option>
                                                    <option value="6">Saturday</option>
                                                </select>
                                            </div>
                                        )}

                                        {newTaskRecurringType === "monthly" && (
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-slate-300">Day of Month</label>
                                                <input type="number" min="1" max="31" value={newTaskRecurringDay} onChange={(e) => setNewTaskRecurringDay(e.target.value)} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button onClick={editingTask ? updateTask : addTask} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium">{editingTask ? "Update Quest" : "Create Quest"}</button>
                                    <button onClick={() => { setShowTaskForm(false); setEditingTask(null); resetTaskForm(); }} className="flex-1 bg-slate-900 text-slate-300 px-6 py-3 rounded-lg font-medium">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === "daily" && (
                    <div className="bg-slate-800 rounded-xl shadow p-6 border border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">Daily Quests - {currentDate}</h2>
                            <button onClick={() => setShowTaskForm(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-lg">+ New Quest</button>
                        </div>

                        <div className="space-y-3">
                            {dailyTasks.map(task => {
                                const completed = isTaskCompleted(task, currentDate);
                                const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
                                const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;

                                return (
                                    <div key={task.id} className={`bg-slate-900 rounded-lg p-4 border ${completed ? "border-indigo-700 bg-slate-900/50" : "border-slate-700"}`}>
                                        <div className="flex items-start gap-3">
                                            <input type="checkbox" checked={completed} onChange={() => toggleTask(task, currentDate)} className="mt-1 w-5 h-5 rounded" />

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className={`text-lg font-medium ${completed ? "line-through text-slate-500" : "text-slate-100"}`}>{task.name}</h3>
                                                    {project && <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: project.color + "30", color: project.color }}>{project.name}</span>}
                                                    {taskClass && <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: taskClass.color + "30", color: taskClass.color }}>{taskClass.name}</span>}
                                                </div>

                                                {task.description && <p className="text-sm text-slate-400 mb-2">{task.description}</p>}

                                                <div className="flex gap-4 text-sm text-slate-400 mb-3">
                                                    <span className={`px-2 py-1 rounded ${task.priority === "high" ? "bg-rose-900/50 text-rose-300" : task.priority === "medium" ? "bg-amber-900/50 text-amber-300" : "bg-slate-700 text-slate-300"}`}>{task.priority}</span>
                                                    <span>XP: {task.xpReward}</span>
                                                    {task.statType && <span className="text-indigo-400">+{task.statType}</span>}
                                                </div>

                                                {task.subtasks.length > 0 && (
                                                    <div className="space-y-1 mb-2">
                                                        {task.subtasks.map(sub => (
                                                            <label key={sub.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 p-1 rounded">
                                                                <input type="checkbox" checked={sub.completed} onChange={() => toggleSubtask(task.id, sub.id)} className="w-4 h-4" />
                                                                <span className={sub.completed ? "line-through text-slate-500" : "text-slate-300"}>{sub.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}

                                                {!completed && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => {
                                                            const name = prompt(`Add subtask to "${task.name}"`);
                                                            if (name) addSubtask(task.id, name);
                                                        }} className="text-indigo-400 hover:text-indigo-300 text-sm">+ Add Subtask</button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <button onClick={() => openEditTask(task)} className="text-slate-400 hover:text-slate-200">✏️</button>
                                                {!task.isRecurring && <button onClick={() => deleteTask(task.id)} className="text-rose-500 hover:text-rose-400">✕</button>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {dailyTasks.length === 0 && <p className="text-center text-slate-400 py-8">No quests for today. Create one to get started!</p>}
                        </div>
                    </div>
                )}

                {view === "weekly" && (
                    <div className="bg-slate-800 rounded-xl shadow p-6 border border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">Weekly View</h2>
                            <div className="flex gap-2">
                                <button onClick={() => {
                                    const prevWeek = new Date(currentDate);
                                    prevWeek.setDate(prevWeek.getDate() - 7);
                                    setCurrentDate(prevWeek.toISOString().slice(0, 10));
                                }} className="bg-slate-900 text-slate-300 px-4 py-2 rounded-lg">← Prev</button>
                                <button onClick={() => setCurrentDate(today)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Today</button>
                                <button onClick={() => {
                                    const nextWeek = new Date(currentDate);
                                    nextWeek.setDate(nextWeek.getDate() + 7);
                                    setCurrentDate(nextWeek.toISOString().slice(0, 10));
                                }} className="bg-slate-900 text-slate-300 px-4 py-2 rounded-lg">Next →</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                            {weekDates.map(date => {
                                const tasksForDay = weeklyTasks[date] || [];
                                const isToday = date === today;

                                return (
                                    <div key={date} className={`bg-slate-900 rounded-lg p-4 border ${isToday ? "border-indigo-600" : "border-slate-700"}`}>
                                        <div className="text-center mb-3">
                                            <p className="text-sm text-slate-400">{getDayName(date)}</p>
                                            <p className="text-lg font-semibold">{date.slice(8, 10)}</p>
                                        </div>

                                        <div className="space-y-2">
                                            {tasksForDay.map(task => {
                                                const completed = isTaskCompleted(task, date);
                                                const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;

                                                return (
                                                    <div key={task.id} className={`bg-slate-800 rounded p-2 border ${completed ? "border-indigo-700" : "border-slate-700"} text-xs`}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <input type="checkbox" checked={completed} onChange={() => toggleTask(task, date)} className="w-4 h-4" />
                                                            <span className={`flex-1 ${completed ? "line-through text-slate-500" : "text-slate-200"}`}>{task.name}</span>
                                                        </div>
                                                        {taskClass && <div className="text-xs px-1.5 py-0.5 rounded inline-block" style={{ background: taskClass.color + "30", color: taskClass.color }}>{taskClass.name}</div>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {view === "monthly" && (
                    <div className="bg-slate-800 rounded-xl shadow p-6 border border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">Monthly View - {currentDate.slice(0, 7)}</h2>
                            <div className="flex gap-2">
                                <button onClick={() => {
                                    const [year, month] = currentDate.split("-").map(Number);
                                    const prevMonth = new Date(year, month - 2, 1);
                                    setCurrentDate(prevMonth.toISOString().slice(0, 10));
                                }} className="bg-slate-900 text-slate-300 px-4 py-2 rounded-lg">← Prev</button>
                                <button onClick={() => setCurrentDate(today)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Today</button>
                                <button onClick={() => {
                                    const [year, month] = currentDate.split("-").map(Number);
                                    const nextMonth = new Date(year, month, 1);
                                    setCurrentDate(nextMonth.toISOString().slice(0, 10));
                                }} className="bg-slate-900 text-slate-300 px-4 py-2 rounded-lg">Next →</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                                <div key={day} className="text-center text-sm font-semibold text-slate-400 pb-2">{day}</div>
                            ))}

                            {monthDates.map((date, idx) => {
                                if (!date) return <div key={idx} className="aspect-square"></div>;

                                const tasksForDay = monthlyTasks[date] || [];
                                const isToday = date === today;

                                return (
                                    <div key={date} className={`bg-slate-900 rounded-lg p-2 border ${isToday ? "border-indigo-600" : "border-slate-700"} aspect-square overflow-hidden`}>
                                        <p className="text-center text-sm font-semibold mb-1">{date.slice(8, 10)}</p>
                                        <div className="space-y-1">
                                            {tasksForDay.slice(0, 3).map(task => {
                                                const completed = isTaskCompleted(task, date);
                                                const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;

                                                return (
                                                    <div key={task.id} className={`text-[10px] px-1 py-0.5 rounded ${completed ? "bg-indigo-900/50 line-through" : "bg-slate-800"}`}>
                                                        <div className="truncate">{task.name}</div>
                                                        {taskClass && <div className="text-[8px] truncate" style={{ color: taskClass.color }}>{taskClass.name}</div>}
                                                    </div>
                                                );
                                            })}
                                            {tasksForDay.length > 3 && <p className="text-[10px] text-slate-400">+{tasksForDay.length - 3}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {view === "allTasks" && (
                    <div className="bg-slate-800 rounded-xl shadow p-6 border border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">All Quests</h2>
                            <button onClick={() => setShowTaskForm(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-lg">+ New Quest</button>
                        </div>

                        <div className="space-y-3">
                            {tasks.map(task => {
                                const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
                                const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;

                                return (
                                    <div key={task.id} className={`bg-slate-900 rounded-lg p-4 border ${task.completed ? "border-indigo-700 bg-slate-900/50" : "border-slate-700"}`}>
                                        <div className="flex items-start gap-3">
                                            {!task.isRecurring && <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task, task.dueDate)} className="mt-1 w-5 h-5 rounded" />}

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className={`text-lg font-medium ${task.completed ? "line-through text-slate-500" : "text-slate-100"}`}>{task.name}</h3>
                                                    {project && <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: project.color + "30", color: project.color }}>{project.name}</span>}
                                                    {taskClass && <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: taskClass.color + "30", color: taskClass.color }}>{taskClass.name}</span>}
                                                    {task.isRecurring && <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-900/50 text-indigo-300">Recurring</span>}
                                                </div>

                                                {task.description && <p className="text-sm text-slate-400 mb-2">{task.description}</p>}

                                                <div className="flex gap-4 text-sm text-slate-400">
                                                    <span className={`px-2 py-1 rounded ${task.priority === "high" ? "bg-rose-900/50 text-rose-300" : task.priority === "medium" ? "bg-amber-900/50 text-amber-300" : "bg-slate-700 text-slate-300"}`}>{task.priority}</span>
                                                    <span>Due: {task.dueDate}</span>
                                                    <span>XP: {task.xpReward}</span>
                                                    {task.statType && <span className="text-indigo-400">+{task.statType}</span>}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button onClick={() => openEditTask(task)} className="text-slate-400 hover:text-slate-200">✏️</button>
                                                <button onClick={() => deleteTask(task.id)} className="text-rose-500 hover:text-rose-400">✕</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {tasks.length === 0 && <p className="text-center text-slate-400 py-8">No quests yet. Create one to get started!</p>}
                        </div>
                    </div>
                )}

                {view === "settings" && (
                    <div className="space-y-6">
                        <div className="bg-slate-800 rounded-xl shadow p-6 border border-slate-700">
                            <h2 className="text-2xl font-semibold mb-6">Character</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-300">Hero Name</label>
                                    <input type="text" value={character.name} onChange={(e) => setCharacter({ ...character, name: e.target.value })} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-300">Avatar</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {AVATARS.map(avatar => (
                                            <button key={avatar} onClick={() => setCharacter({ ...character, avatar })} className={`text-4xl p-3 rounded-lg transition-all ${character.avatar === avatar ? "bg-indigo-600 scale-110" : "bg-slate-900 hover:bg-slate-700"}`}>{avatar}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded-xl shadow p-6 border border-slate-700">
                            <h2 className="text-2xl font-semibold mb-6">Stats & Progression</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="text-sm text-slate-300">Strength</p>
                                            <p className="text-2xl font-bold text-slate-100">{character.strength}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-slate-300">Unspent: {character.unspentPoints}</div>
                                            <button onClick={() => assignPointToStat("strength")} disabled={character.unspentPoints <= 0} className="mt-2 px-3 py-1 bg-indigo-600 rounded disabled:opacity-40">+1</button>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-xs text-slate-400 mb-1">Progress to next stat point</p>
                                        <ProgressBar value={statProgress.strength} max={tasksNeededForStat(character.strength)} />
                                        <p className="text-xs text-slate-400 mt-1">{statProgress.strength}/{tasksNeededForStat(character.strength)} tasks</p>
                                    </div>
                                </div>

                                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="text-sm text-slate-300">Dexterity</p>
                                            <p className="text-2xl font-bold text-slate-100">{character.dexterity}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-slate-300">Unspent: {character.unspentPoints}</div>
                                            <button onClick={() => assignPointToStat("dexterity")} disabled={character.unspentPoints <= 0} className="mt-2 px-3 py-1 bg-indigo-600 rounded disabled:opacity-40">+1</button>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-xs text-slate-400 mb-1">Progress to next stat point</p>
                                        <ProgressBar value={statProgress.dexterity} max={tasksNeededForStat(character.dexterity)} />
                                        <p className="text-xs text-slate-400 mt-1">{statProgress.dexterity}/{tasksNeededForStat(character.dexterity)} tasks</p>
                                    </div>
                                </div>

                                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="text-sm text-slate-300">Intelligence</p>
                                            <p className="text-2xl font-bold text-slate-100">{character.intelligence}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-slate-300">Unspent: {character.unspentPoints}</div>
                                            <button onClick={() => assignPointToStat("intelligence")} disabled={character.unspentPoints <= 0} className="mt-2 px-3 py-1 bg-indigo-600 rounded disabled:opacity-40">+1</button>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-xs text-slate-400 mb-1">Progress to next stat point</p>
                                        <ProgressBar value={statProgress.intelligence} max={tasksNeededForStat(character.intelligence)} />
                                        <p className="text-xs text-slate-400 mt-1">{statProgress.intelligence}/{tasksNeededForStat(character.intelligence)} tasks</p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-sm text-slate-400">Punkty za poziom: po awansie otrzymujesz 1 punkt do rozdania. Zadania przypisane do klasy zwiększają postęp statystyk automatycznie (patrz paski postępu).</div>
                        </div>

                        <div className="bg-rose-900 rounded-xl p-6 border border-rose-700">
                            <h3 className="text-xl font-semibold text-rose-100 mb-2">Danger Zone</h3>
                            <p className="text-rose-200 text-sm mb-4">Reset all progress and start fresh. This action cannot be undone.</p>
                            <button onClick={() => setShowResetConfirm(true)} className="bg-rose-700 hover:bg-rose-600 text-white px-6 py-3 rounded-lg">Reset All Progress</button>
                        </div>

                        {showResetConfirm && (
                            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                                <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
                                    <h3 className="text-2xl font-semibold mb-4 text-rose-400">⚠️ Confirm Reset</h3>
                                    <p className="text-slate-300 mb-6">Are you sure you want to reset all progress? This will delete all tasks, projects, classes and stats.</p>
                                    <div className="flex gap-3">
                                        <button onClick={resetProgress} className="flex-1 bg-rose-700 hover:bg-rose-600 text-white px-6 py-3 rounded-lg">Yes, Reset Everything</button>
                                        <button onClick={() => setShowResetConfirm(false)} className="flex-1 bg-slate-900 text-slate-300 px-6 py-3 rounded-lg">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {view === "projects" && (
                    <div className="bg-slate-800 rounded-xl shadow p-6 border border-slate-700">
                        <h2 className="text-2xl font-semibold mb-6">Projects & Classes</h2>

                        <div className="bg-slate-900 rounded-lg p-4 mb-6 border border-slate-700">
                            <h3 className="text-lg font-semibold mb-3">Create New Project</h3>
                            <div className="space-y-3">
                                <input type="text" placeholder="Project name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100" />
                                <input type="text" placeholder="Description" value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100" />
                                <div className="flex gap-3">
                                    <input type="color" value={newProjectColor} onChange={(e) => setNewProjectColor(e.target.value)} className="w-16 h-12 rounded" />
                                    <button onClick={addProject} className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg">Create Project</button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {projects.map(project => {
                                const projectTasks = tasks.filter(t => t.projectId === project.id);
                                const completedTasks = projectTasks.filter(t => t.completed).length;
                                return (
                                    <div key={project.id} className="bg-slate-900 rounded-lg p-6 border-l-4 border border-slate-700" style={{ borderLeftColor: project.color }}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-semibold" style={{ color: project.color }}>{project.name}</h3>
                                                <p className="text-sm text-slate-300">{project.description}</p>
                                            </div>
                                            <button onClick={() => deleteProject(project.id)} className="text-rose-500 hover:text-rose-400">✕</button>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm text-slate-300"><span>Total Quests:</span><span className="text-slate-100">{projectTasks.length}</span></div>
                                            <div className="flex justify-between text-sm text-slate-300"><span>Completed:</span><span className="text-slate-100">{completedTasks}</span></div>
                                            <div className="flex justify-between text-sm text-slate-300"><span>Active:</span><span className="text-slate-100">{projectTasks.length - completedTasks}</span></div>
                                            {projectTasks.length > 0 && (
                                                <div className="mt-3">
                                                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                                                        <div className="h-full transition-all duration-500" style={{ width: `${(completedTasks / projectTasks.length) * 100}%`, background: project.color }} />
                                                    </div>
                                                    <p className="text-center text-xs text-slate-400 mt-1">{Math.round((completedTasks / projectTasks.length) * 100)}% Complete</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-700">
                                            <h4 className="text-sm font-semibold mb-2 text-slate-300">Recent Quests</h4>
                                            <div className="space-y-1">
                                                {projectTasks.slice(0, 3).map(task => (
                                                    <div key={task.id} className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${task.completed ? 'bg-indigo-600' : 'bg-slate-600'}`} />
                                                        <span className={`text-xs ${task.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>{task.name}</span>
                                                    </div>
                                                ))}
                                                {projectTasks.length > 3 && <p className="text-xs text-slate-400">+{projectTasks.length - 3} more...</p>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                            <h3 className="text-lg font-semibold mb-3">Task Classes (map to stats)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <input type="text" placeholder="Class name (e.g. Running)" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100" />
                                <select value={newClassStat} onChange={(e) => setNewClassStat(e.target.value as "strength" | "dexterity" | "intelligence")} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100">
                                    <option value="strength">Strength</option>
                                    <option value="dexterity">Dexterity</option>
                                    <option value="intelligence">Intelligence</option>
                                </select>
                                <div className="flex gap-2 items-center">
                                    <input type="color" value={newClassColor} onChange={(e) => setNewClassColor(e.target.value)} className="w-16 h-12 rounded" />
                                    <button onClick={addTaskClass} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg">Add Class</button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {taskClasses.map(c => (
                                    <div key={c.id} className="flex items-center justify-between bg-slate-800 p-3 rounded border border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: c.color }}>{c.name[0]}</div>
                                            <div>
                                                <div className="font-medium text-slate-100">{c.name}</div>
                                                <div className="text-xs text-slate-400">{c.statType}</div>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteTaskClass(c.id)} className="text-rose-500 hover:text-rose-400">Delete</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
