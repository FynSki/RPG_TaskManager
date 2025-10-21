import React, { useState, useEffect } from "react";

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
    projectId: string;
    name: string;
    description: string;
    completed: boolean;
    xpReward: number;
    priority: "low" | "medium" | "high";
    dueDate: string;
    subtasks: SubTask[];
    createdAt: string;
};

type Character = {
    name: string;
    level: number;
    xp: number;
    totalXp: number;
};

function usePersistedState<T>(key: string, defaultValue: T) {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch {
            // Silent fail
        }
    }, [key, state]);

    return [state, setState] as const;
}

function calculateXpForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
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
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const dates: string[] = [];
    for (let d = firstDay.getDate(); d <= lastDay.getDate(); d++) {
        const currentDate = new Date(year, month, d);
        dates.push(currentDate.toISOString().slice(0, 10));
    }
    return dates;
}

function getDayName(dateStr: string): string {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
}

function getMonthName(dateStr: string): string {
    const date = new Date(dateStr);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.getMonth()];
}

export default function App() {
    const today = new Date().toISOString().slice(0, 10);

    const [projects, setProjects] = usePersistedState<Project[]>("rpgProjectManagerProjects", [
        { id: "proj1", name: "Personal Development", color: "#3b82f6", description: "Self-improvement goals" }
    ]);

    const [tasks, setTasks] = usePersistedState<Task[]>("rpgProjectManagerTasks", []);
    const [character, setCharacter] = usePersistedState<Character>("rpgProjectManagerCharacter", {
        name: "Hero",
        level: 1,
        xp: 0,
        totalXp: 0
    });

    const [view, setView] = useState<"daily" | "weekly" | "monthly" | "character" | "projects">("daily");
    const [selectedDate, setSelectedDate] = useState(today);
    const [expandedTask, setExpandedTask] = useState<string | null>(null);

    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");
    const [newProjectColor, setNewProjectColor] = useState("#3b82f6");

    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [taskModalDate, setTaskModalDate] = useState(today);
    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskDesc, setNewTaskDesc] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
    const [newTaskXP, setNewTaskXP] = useState(50);
    const [newTaskProject, setNewTaskProject] = useState(projects[0]?.id || "");

    const [editingCharacter, setEditingCharacter] = useState(false);
    const [newCharacterName, setNewCharacterName] = useState(character.name);

    const xpForNextLevel = calculateXpForLevel(character.level);
    const xpProgress = (character.xp / xpForNextLevel) * 100;

    const weekDates = getWeekDates(selectedDate);
    const monthDates = getMonthDates(selectedDate);

    const addProject = () => {
        if (!newProjectName.trim()) return;
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            name: newProjectName,
            color: newProjectColor,
            description: newProjectDesc
        };
        setProjects([...projects, newProject]);
        setNewProjectName("");
        setNewProjectDesc("");
        setNewProjectColor("#3b82f6");
    };

    const deleteProject = (id: string) => {
        if (projects.length <= 1) {
            alert("You must have at least one project!");
            return;
        }
        setProjects(projects.filter(p => p.id !== id));
        setTasks(tasks.filter(t => t.projectId !== id));
    };

    const addTask = () => {
        if (!newTaskName.trim() || !newTaskProject) return;
        const newTask: Task = {
            id: `task-${Date.now()}`,
            projectId: newTaskProject,
            name: newTaskName,
            description: newTaskDesc,
            completed: false,
            xpReward: newTaskXP,
            priority: newTaskPriority,
            dueDate: taskModalDate,
            subtasks: [],
            createdAt: new Date().toISOString()
        };
        setTasks([...tasks, newTask]);
        setNewTaskName("");
        setNewTaskDesc("");
        setNewTaskPriority("medium");
        setNewTaskXP(50);
        setShowAddTaskModal(false);
    };

    const toggleTask = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const wasCompleted = task.completed;

        setTasks(tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        ));

        if (!wasCompleted) {
            const newXp = character.xp + task.xpReward;
            const newTotalXp = character.totalXp + task.xpReward;
            let newLevel = character.level;
            let remainingXp = newXp;

            while (remainingXp >= calculateXpForLevel(newLevel)) {
                remainingXp -= calculateXpForLevel(newLevel);
                newLevel++;
            }

            setCharacter({
                ...character,
                level: newLevel,
                xp: remainingXp,
                totalXp: newTotalXp
            });
        } else {
            const newXp = Math.max(0, character.xp - task.xpReward);
            const newTotalXp = Math.max(0, character.totalXp - task.xpReward);
            setCharacter({
                ...character,
                xp: newXp,
                totalXp: newTotalXp
            });
        }
    };

    const deleteTask = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };

    const addSubtask = (taskId: string, subtaskName: string) => {
        if (!subtaskName.trim()) return;
        setTasks(tasks.map(t =>
            t.id === taskId
                ? { ...t, subtasks: [...t.subtasks, { id: `sub-${Date.now()}`, name: subtaskName, completed: false }] }
                : t
        ));
    };

    const toggleSubtask = (taskId: string, subtaskId: string) => {
        setTasks(tasks.map(t =>
            t.id === taskId
                ? { ...t, subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st) }
                : t
        ));
    };

    const deleteSubtask = (taskId: string, subtaskId: string) => {
        setTasks(tasks.map(t =>
            t.id === taskId
                ? { ...t, subtasks: t.subtasks.filter(st => st.id !== subtaskId) }
                : t
        ));
    };

    const updateCharacterName = () => {
        if (newCharacterName.trim()) {
            setCharacter({ ...character, name: newCharacterName });
            setEditingCharacter(false);
        }
    };

    const getTasksForDate = (date: string) => {
        return tasks.filter(t => t.dueDate === date);
    };

    const getTasksByProject = (projectId: string) => {
        return tasks.filter(t => t.projectId === projectId);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return "text-red-600 bg-red-50";
            case "medium": return "text-yellow-600 bg-yellow-50";
            case "low": return "text-green-600 bg-green-50";
            default: return "text-gray-600 bg-gray-50";
        }
    };

    const changeDate = (days: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().slice(0, 10));
    };

    const changeWeek = (weeks: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + (weeks * 7));
        setSelectedDate(date.toISOString().slice(0, 10));
    };

    const changeMonth = (months: number) => {
        const date = new Date(selectedDate);
        date.setMonth(date.getMonth() + months);
        setSelectedDate(date.toISOString().slice(0, 10));
    };

    const openAddTaskModal = (date: string) => {
        setTaskModalDate(date);
        setNewTaskProject(projects[0]?.id || "");
        setShowAddTaskModal(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="text-3xl">⚔️</span>
                            Quest Manager
                        </h1>
                        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg">
                            <span className="text-xl">⭐</span>
                            <span className="font-semibold">Level {character.level}</span>
                        </div>
                    </div>

                    {/* XP Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{character.name}</span>
                            <span className="text-gray-600">{character.xp} / {xpForNextLevel} XP</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                                style={{ width: `${xpProgress}%` }}
                            />
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setView("daily")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === "daily" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            📅 Daily
                        </button>
                        <button
                            onClick={() => setView("weekly")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === "weekly" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            📆 Weekly
                        </button>
                        <button
                            onClick={() => setView("monthly")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === "monthly" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            🗓️ Monthly
                        </button>
                        <button
                            onClick={() => setView("projects")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === "projects" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            🏆 Projects
                        </button>
                        <button
                            onClick={() => setView("character")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === "character" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            👤 Character
                        </button>
                    </div>
                </div>

                {/* Add Task Modal */}
                {showAddTaskModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">Add Quest for {taskModalDate}</h3>
                                <button onClick={() => setShowAddTaskModal(false)} className="text-2xl text-gray-500 hover:text-gray-700">✕</button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Quest Name</label>
                                    <input
                                        type="text"
                                        value={newTaskName}
                                        onChange={(e) => setNewTaskName(e.target.value)}
                                        placeholder="Enter quest name..."
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={newTaskDesc}
                                        onChange={(e) => setNewTaskDesc(e.target.value)}
                                        placeholder="Quest description..."
                                        className="w-full px-3 py-2 border rounded-lg"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Project</label>
                                    <select
                                        value={newTaskProject}
                                        onChange={(e) => setNewTaskProject(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg bg-white"
                                    >
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Priority</label>
                                        <select
                                            value={newTaskPriority}
                                            onChange={(e) => setNewTaskPriority(e.target.value as "low" | "medium" | "high")}
                                            className="w-full px-3 py-2 border rounded-lg bg-white"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">XP Reward</label>
                                        <input
                                            type="number"
                                            value={newTaskXP}
                                            onChange={(e) => setNewTaskXP(Number(e.target.value))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            min="1"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={addTask}
                                        className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        Add Quest
                                    </button>
                                    <button
                                        onClick={() => setShowAddTaskModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Daily View */}
                {view === "daily" && (
                    <div>
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={() => changeDate(-1)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-xl">←</button>
                                <h2 className="text-xl font-bold text-gray-800">{selectedDate}</h2>
                                <button onClick={() => changeDate(1)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-xl">→</button>
                            </div>
                            <button onClick={() => setSelectedDate(today)} className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-2">
                                Today
                            </button>
                            <button onClick={() => openAddTaskModal(selectedDate)} className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                ➕ Add Quest
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Today&apos;s Quests</h3>
                            {getTasksForDate(selectedDate).length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No quests for this day.</p>
                            ) : (
                                <div className="space-y-3">
                                    {getTasksForDate(selectedDate).map(task => {
                                        const project = projects.find(p => p.id === task.projectId);
                                        const isExpanded = expandedTask === task.id;
                                        const completedSubtasks = task.subtasks.filter(st => st.completed).length;

                                        return (
                                            <div key={task.id} className="border rounded-lg overflow-hidden" style={{ borderLeft: `4px solid ${project?.color}` }}>
                                                <div className="p-4 bg-white">
                                                    <div className="flex items-start gap-3">
                                                        <button onClick={() => toggleTask(task.id)} className="mt-1 text-2xl">
                                                            {task.completed ? "✅" : "⭕"}
                                                        </button>
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <h4 className={`font-semibold ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                                                                        {task.name}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                                                                            {task.priority}
                                                                        </span>
                                                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                                                                            +{task.xpReward} XP
                                                                        </span>
                                                                        {task.subtasks.length > 0 && (
                                                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                                                                {completedSubtasks}/{task.subtasks.length} subtasks
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                                                                        className="ml-2 p-1 hover:bg-gray-100 rounded text-xl"
                                                                    >
                                                                        {isExpanded ? "▼" : "▶"}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteTask(task.id)}
                                                                        className="p-1 hover:bg-gray-100 rounded text-red-500"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {isExpanded && (
                                                                <div className="mt-4 pt-4 border-t">
                                                                    <h5 className="font-medium text-sm mb-2">Subtasks</h5>
                                                                    <div className="space-y-2 mb-3">
                                                                        {task.subtasks.map(st => (
                                                                            <div key={st.id} className="flex items-center gap-2 pl-4">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={st.completed}
                                                                                    onChange={() => toggleSubtask(task.id, st.id)}
                                                                                    className="w-4 h-4"
                                                                                />
                                                                                <span className={`flex-1 text-sm ${st.completed ? "line-through text-gray-400" : ""}`}>
                                                                                    {st.name}
                                                                                </span>
                                                                                <button
                                                                                    onClick={() => deleteSubtask(task.id, st.id)}
                                                                                    className="text-red-500 hover:text-red-700"
                                                                                >
                                                                                    ✕
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="New subtask..."
                                                                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === "Enter") {
                                                                                    addSubtask(task.id, e.currentTarget.value);
                                                                                    e.currentTarget.value = "";
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
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
                )}

                {/* Weekly View */}
                {view === "weekly" && (
                    <div>
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={() => changeWeek(-1)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-xl">←</button>
                                <h2 className="text-xl font-bold text-gray-800">Week: {weekDates[0]} - {weekDates[6]}</h2>
                                <button onClick={() => changeWeek(1)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-xl">→</button>
                            </div>
                            <button onClick={() => setSelectedDate(today)} className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                This Week
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                            {weekDates.map(date => {
                                const dayTasks = getTasksForDate(date);
                                const isToday = date === today;

                                return (
                                    <div key={date} className={`bg-white rounded-xl shadow-lg overflow-hidden ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
                                        <div className={`p-3 ${isToday ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                                            <div className="text-center">
                                                <div className="font-bold">{getDayName(date)}</div>
                                                <div className="text-sm">{date.slice(5)}</div>
                                            </div>
                                        </div>

                                        <div className="p-3">
                                            <button
                                                onClick={() => openAddTaskModal(date)}
                                                className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm mb-3"
                                            >
                                                ➕ Add
                                            </button>

                                            <div className="space-y-2">
                                                {dayTasks.length === 0 ? (
                                                    <p className="text-gray-400 text-xs text-center py-2">No quests</p>
                                                ) : (
                                                    dayTasks.map(task => {
                                                        const project = projects.find(p => p.id === task.projectId);
                                                        return (
                                                            <div
                                                                key={task.id}
                                                                className="p-2 rounded border text-xs"
                                                                style={{ borderLeft: `3px solid ${project?.color}` }}
                                                            >
                                                                <div className="flex items-start gap-1">
                                                                    <button onClick={() => toggleTask(task.id)} className="text-base">
                                                                        {task.completed ? "✅" : "⭕"}
                                                                    </button>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className={`font-medium truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                                                            {task.name}
                                                                        </p>
                                                                        <span className={`inline-block px-1 py-0.5 rounded text-xs ${getPriorityColor(task.priority)}`}>
                                                                            {task.priority}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Monthly View */}
                {view === "monthly" && (
                    <div>
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={() => changeMonth(-1)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-xl">←</button>
                                <h2 className="text-xl font-bold text-gray-800">{getMonthName(selectedDate)} {new Date(selectedDate).getFullYear()}</h2>
                                <button onClick={() => changeMonth(1)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-xl">→</button>
                            </div>
                            <button onClick={() => setSelectedDate(today)} className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                This Month
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-4">
                            <div className="grid grid-cols-7 gap-2">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <div key={day} className="text-center font-bold text-sm py-2 bg-gray-100 rounded">
                                        {day}
                                    </div>
                                ))}

                                {monthDates.map(date => {
                                    const dayTasks = getTasksForDate(date);
                                    const isToday = date === today;
                                    const completedCount = dayTasks.filter(t => t.completed).length;

                                    return (
                                        <div
                                            key={date}
                                            className={`min-h-24 p-2 border rounded-lg ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white hover:bg-gray-50'} cursor-pointer`}
                                            onClick={() => openAddTaskModal(date)}
                                        >
                                            <div className="text-sm font-semibold mb-1">{new Date(date).getDate()}</div>
                                            <div className="space-y-1">
                                                {dayTasks.slice(0, 2).map(task => {
                                                    const project = projects.find(p => p.id === task.projectId);
                                                    return (
                                                        <div
                                                            key={task.id}
                                                            className="text-xs p-1 rounded truncate"
                                                            style={{ backgroundColor: project?.color + '20', borderLeft: `2px solid ${project?.color}` }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleTask(task.id);
                                                            }}
                                                        >
                                                            {task.completed ? '✓' : '○'} {task.name}
                                                        </div>
                                                    );
                                                })}
                                                {dayTasks.length > 2 && (
                                                    <div className="text-xs text-gray-500 text-center">
                                                        +{dayTasks.length - 2} more
                                                    </div>
                                                )}
                                                {dayTasks.length > 0 && (
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        {completedCount}/{dayTasks.length} done
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Projects View */}
                {view === "projects" && (
                    <div>
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Project</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="Project name..."
                                    className="px-4 py-2 border rounded-lg"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={newProjectColor}
                                        onChange={(e) => setNewProjectColor(e.target.value)}
                                        className="w-12 h-10 border rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        value={newProjectColor}
                                        onChange={(e) => setNewProjectColor(e.target.value)}
                                        className="flex-1 px-4 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                            <textarea
                                value={newProjectDesc}
                                onChange={(e) => setNewProjectDesc(e.target.value)}
                                placeholder="Project description..."
                                className="w-full px-4 py-2 border rounded-lg mb-4"
                                rows={2}
                            />
                            <button onClick={addProject} className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                ➕ Add Project
                            </button>
                        </div>

                        <div className="space-y-4">
                            {projects.map(project => {
                                const projectTasks = getTasksByProject(project.id);
                                const completedTasks = projectTasks.filter(t => t.completed).length;

                                return (
                                    <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                        <div className="p-6" style={{ borderLeft: `6px solid ${project.color}` }}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-2xl font-bold text-gray-800">{project.name}</h3>
                                                    <p className="text-gray-600 mt-1">{project.description}</p>
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        Progress: {completedTasks}/{projectTasks.length} quests completed
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => deleteProject(project.id)}
                                                    className="text-red-500 hover:text-red-700 ml-4 text-xl"
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="font-semibold">Quests ({projectTasks.length})</h4>
                                                {projectTasks.length === 0 ? (
                                                    <p className="text-gray-500 text-sm italic">No quests in this project</p>
                                                ) : (
                                                    projectTasks.map(task => (
                                                        <div key={task.id} className="border rounded-lg p-3 bg-gray-50">
                                                            <div className="flex items-start gap-2">
                                                                <button onClick={() => toggleTask(task.id)} className="text-xl">
                                                                    {task.completed ? "✅" : "⭕"}
                                                                </button>
                                                                <div className="flex-1">
                                                                    <p className={`font-medium ${task.completed ? "line-through text-gray-400" : ""}`}>
                                                                        {task.name}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                        <span className="text-xs text-gray-500">{task.dueDate}</span>
                                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                                                                            {task.priority}
                                                                        </span>
                                                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                                                            +{task.xpReward} XP
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <button onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-700">
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Character View */}
                {view === "character" && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="text-center mb-8">
                            <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-6xl">
                                👤
                            </div>
                            {editingCharacter ? (
                                <div className="flex items-center justify-center gap-2">
                                    <input
                                        type="text"
                                        value={newCharacterName}
                                        onChange={(e) => setNewCharacterName(e.target.value)}
                                        className="px-4 py-2 border rounded-lg text-center"
                                    />
                                    <button onClick={updateCharacterName} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                    {character.name}
                                    <button onClick={() => setEditingCharacter(true)} className="ml-2 text-sm text-blue-500 hover:text-blue-700">
                                        Edit
                                    </button>
                                </h2>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-6 text-center">
                                <div className="text-5xl mb-2">🏆</div>
                                <p className="text-4xl font-bold text-yellow-800">{character.level}</p>
                                <p className="text-yellow-700 font-medium">Level</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-6 text-center">
                                <div className="text-5xl mb-2">⭐</div>
                                <p className="text-4xl font-bold text-purple-800">{character.xp}</p>
                                <p className="text-purple-700 font-medium">Current XP</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6 text-center">
                                <div className="text-5xl mb-2">⚔️</div>
                                <p className="text-4xl font-bold text-blue-800">{character.totalXp}</p>
                                <p className="text-blue-700 font-medium">Total XP</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 mb-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Progress to Next Level</h3>
                            <div className="mb-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Level {character.level}</span>
                                    <span>Level {character.level + 1}</span>
                                </div>
                                <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500 flex items-center justify-center text-white text-xs font-bold"
                                        style={{ width: `${xpProgress}%` }}
                                    >
                                        {Math.round(xpProgress)}%
                                    </div>
                                </div>
                                <p className="text-center mt-2 text-sm text-gray-600">
                                    {xpForNextLevel - character.xp} XP needed to level up
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-6 mb-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Completed Quests:</span>
                                    <span className="font-bold">{tasks.filter(t => t.completed).length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Active Quests:</span>
                                    <span className="font-bold">{tasks.filter(t => !t.completed).length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Total Projects:</span>
                                    <span className="font-bold">{projects.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Average XP per Quest:</span>
                                    <span className="font-bold">
                                        {tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.xpReward, 0) / tasks.length) : 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Achievements</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-4 rounded-lg border-2 ${character.totalXp >= 100 ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-100 border-gray-300 opacity-50'}`}>
                                    <div className="text-4xl mb-2">{character.totalXp >= 100 ? '🏆' : '🔒'}</div>
                                    <p className="font-bold">First Steps</p>
                                    <p className="text-sm text-gray-600">Earn 100 total XP</p>
                                </div>
                                <div className={`p-4 rounded-lg border-2 ${character.level >= 5 ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-100 border-gray-300 opacity-50'}`}>
                                    <div className="text-4xl mb-2">{character.level >= 5 ? '⭐' : '🔒'}</div>
                                    <p className="font-bold">Rising Star</p>
                                    <p className="text-sm text-gray-600">Reach Level 5</p>
                                </div>
                                <div className={`p-4 rounded-lg border-2 ${tasks.filter(t => t.completed).length >= 10 ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-100 border-gray-300 opacity-50'}`}>
                                    <div className="text-4xl mb-2">{tasks.filter(t => t.completed).length >= 10 ? '✅' : '🔒'}</div>
                                    <p className="font-bold">Quest Master</p>
                                    <p className="text-sm text-gray-600">Complete 10 quests</p>
                                </div>
                                <div className={`p-4 rounded-lg border-2 ${projects.length >= 3 ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-100 border-gray-300 opacity-50'}`}>
                                    <div className="text-4xl mb-2">{projects.length >= 3 ? '⚔️' : '🔒'}</div>
                                    <p className="font-bold">Ambitious</p>
                                    <p className="text-sm text-gray-600">Create 3 projects</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}