import { useState } from "react";

/**
 * TaskQuest - Gamified Task Management Application
 * 
 * A professional RPG-style task manager with:
 * - Character progression with 5 stats
 * - Daily, weekly, and monthly task views
 * - Recurring tasks with end dates
 * - Flexible tasks without deadlines
 * - Projects, task classes, and custom skills
 * - Active tasks overview
 * 
 * REFACTORED: Now uses modular utilities and types
 */

// ==================== IMPORTS ====================

// Types
import type {
    Task,
    Character,
    Project,
    TaskClass,
    Skill,
    RecurringTaskCompletion,
    ViewType,
    StatType
} from './refactored-src/types/index';

import {
    AVATARS,
    STAT_DESCRIPTIONS,
    STAT_CONFIG,
    DEFAULT_CHARACTER
} from './refactored-src/constants/index';

import {
    getWeekDates,
    getMonthDates,
    getDayName,
    formatShortDate,
    formatFullDateTime,
    getToday,
    getTomorrow,
    addDays,
    addMonths,

    getTasksForDate,
    isTaskCompletedOnDate,
    getActiveRecurringTasks,
    sortTasks,
    generateRandomColor,
    toggleRecurringTaskCompletion,

    calculateXpForLevel,
    awardXP as awardXPUtil,

    usePersistedState
} from './refactored-src/utils/index';

// ==================== UTILITY COMPONENTS ====================

function ProgressBar({ value, max }: { value: number; max: number }) {
    const pct = (value / max) * 100;
    return (
        <div className="relative w-full h-2 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
            <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 to-indigo-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

// ==================== MAIN COMPONENT ====================

export default function App() {
    // ========== STATE ==========

    // View state
    const [view, setView] = useState<ViewType>("character");

    // Data state (persisted to localStorage)
    const [tasks, setTasks] = usePersistedState<Task[]>("tasks", []);
    const [projects, setProjects] = usePersistedState<Project[]>("projects", []);
    const [taskClasses, setTaskClasses] = usePersistedState<TaskClass[]>("taskClasses", []);
    const [skills, setSkills] = usePersistedState<Skill[]>("skills", []);
    const [character, setCharacter] = usePersistedState<Character>("character", DEFAULT_CHARACTER);
    const [recurringCompletions, setRecurringCompletions] = usePersistedState<RecurringTaskCompletion[]>(
        "recurringCompletions",
        []
    );

    // Date selection state
    const [selectedDate, setSelectedDate] = useState(getToday());
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    // Modal state
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showCompletedTaskModal, setShowCompletedTaskModal] = useState(false);
    const [viewingTask, setViewingTask] = useState<Task | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showInfoPopup, setShowInfoPopup] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showStatInfo, setShowStatInfo] = useState<string | null>(null);

    // Task form state
    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
    const [taskDueDate, setTaskDueDate] = useState("");
    const [taskXpReward, setTaskXpReward] = useState(50);
    const [taskProjectId, setTaskProjectId] = useState<string>("");
    const [taskIsRecurring, setTaskIsRecurring] = useState(false);
    const [taskRecurringType, setTaskRecurringType] = useState<"daily" | "weekly" | "monthly">("daily");
    const [taskRecurringDay, setTaskRecurringDay] = useState<number>(1);
    const [taskRecurringEndDate, setTaskRecurringEndDate] = useState<string>("");
    const [taskClassId, setTaskClassId] = useState<string>("");
    const [taskSkillId, setTaskSkillId] = useState<string>("");
    const [taskIsFlexible, setTaskIsFlexible] = useState(false);

    // Project form state
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");

    // Task class form state
    const [newClassName, setNewClassName] = useState("");
    const [newClassStat, setNewClassStat] = useState<StatType>("strength");

    // Skill form state
    const [newSkillName, setNewSkillName] = useState("");

    // ========== COMPUTED VALUES ==========

    const today = getToday();
    const tomorrow = getTomorrow();
    const weekDates = getWeekDates(selectedDate);
    const monthDates = getMonthDates(selectedMonth);
    const dailyTasks = getTasksForDate(tasks, selectedDate);
    const sortedTasks = sortTasks(tasks);
    const xpForNextLevel = calculateXpForLevel(character.level);

    // ========== NAVIGATION FUNCTIONS ==========

    function goToPreviousWeek() {
        setSelectedDate(addDays(selectedDate, -7));
    }

    function goToNextWeek() {
        setSelectedDate(addDays(selectedDate, 7));
    }

    function goToPreviousMonth() {
        setSelectedMonth(addMonths(selectedMonth, -1));
    }

    function goToNextMonth() {
        setSelectedMonth(addMonths(selectedMonth, 1));
    }

    // ========== MODAL FUNCTIONS ==========

    function openTaskModal(date?: string) {
        setEditingTask(null);
        setTaskName("");
        setTaskDescription("");
        setTaskPriority("medium");
        setTaskDueDate(date || selectedDate);
        setTaskXpReward(50);
        setTaskProjectId("");
        setTaskIsRecurring(false);
        setTaskRecurringType("daily");
        setTaskRecurringDay(1);
        setTaskRecurringEndDate("");
        setTaskClassId("");
        setTaskSkillId("");
        setTaskIsFlexible(false);
        setShowTaskModal(true);
    }

    function openEditModal(task: Task) {
        setEditingTask(task);
        setTaskName(task.name);
        setTaskDescription(task.description);
        setTaskPriority(task.priority);
        setTaskDueDate(task.dueDate);
        setTaskXpReward(task.xpReward);
        setTaskProjectId(task.projectId || "");
        setTaskIsRecurring(task.isRecurring || false);
        setTaskRecurringType(task.recurringType || "daily");
        setTaskRecurringDay(task.recurringDay || 1);
        setTaskRecurringEndDate(task.recurringEndDate || "");
        setTaskClassId(task.classId || "");
        setTaskSkillId(task.skillId || "");
        setTaskIsFlexible(task.isFlexible || false);
        setShowTaskModal(true);
    }

    function openCompletedTaskView(task: Task) {
        setViewingTask(task);
        setShowCompletedTaskModal(true);
    }

    function closeTaskModal() {
        setShowTaskModal(false);
        setEditingTask(null);
    }

    // ========== TASK MANAGEMENT FUNCTIONS ==========

    function saveTask() {
        if (!taskName.trim()) return;

        const taskData: Task = {
            id: editingTask?.id || Date.now().toString(),
            projectId: taskProjectId || null,
            name: taskName,
            description: taskDescription,
            completed: editingTask?.completed || false,
            completedAt: editingTask?.completedAt,
            xpReward: taskXpReward,
            priority: taskPriority,
            dueDate: taskIsFlexible ? "" : taskDueDate,
            subtasks: editingTask?.subtasks || [],
            createdAt: editingTask?.createdAt || new Date().toISOString(),
            isRecurring: taskIsRecurring,
            recurringType: taskIsRecurring ? taskRecurringType : undefined,
            recurringDay: taskIsRecurring && taskRecurringType !== "daily" ? taskRecurringDay : undefined,
            recurringEndDate: taskIsRecurring && taskRecurringEndDate ? taskRecurringEndDate : undefined,
            classId: taskClassId || null,
            skillId: taskSkillId || null,
            isFlexible: taskIsFlexible,
        };

        if (editingTask) {
            setTasks(tasks.map(t => (t.id === editingTask.id ? taskData : t)));
        } else {
            setTasks([...tasks, taskData]);
        }

        closeTaskModal();
    }

    function deleteTask(taskId: string) {
        setTasks(tasks.filter(t => t.id !== taskId));
    }

    function toggleTask(taskId: string, date?: string) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        if (task.isRecurring && date) {
            // Toggle recurring task for specific date
            const updatedCompletions = toggleRecurringTaskCompletion(taskId, date, recurringCompletions);
            setRecurringCompletions(updatedCompletions);

            // Award XP if completing
            const isCompleting = !recurringCompletions.find(
                rc => rc.taskId === taskId && rc.date === date
            )?.completed;

            if (isCompleting) {
                handleAwardXP(task.xpReward, task);
            }
        } else {
            // Toggle regular task
            const wasCompleted = task.completed;
            const updatedTask = {
                ...task,
                completed: !task.completed,
                completedAt: !task.completed ? new Date().toISOString() : undefined,
                dueDate: task.isFlexible && !task.completed ? date || today : task.dueDate
            };
            setTasks(tasks.map(t => (t.id === taskId ? updatedTask : t)));

            if (!wasCompleted) {
                handleAwardXP(task.xpReward, task);
            }
        }
    }

    function getFlexibleTasks(): Task[] {
        return tasks.filter(t => !t.completed && t.isFlexible);
    }

    function getTodayTasksList(): Task[] {
        return tasks.filter(t => !t.completed && t.dueDate === today && !t.isRecurring);
    }

    function getTomorrowTasksList(): Task[] {
        return tasks.filter(t => !t.completed && t.dueDate === tomorrow && !t.isRecurring);
    }

    function getActiveRecurringTasksList(): Task[] {
        return getActiveRecurringTasks(tasks);
    }

    function isTaskCompleted(task: Task, date: string): boolean {
        return isTaskCompletedOnDate(task, date, recurringCompletions);
    }
    function handleAwardXP(xp: number, task: Task) {
        const result = awardXPUtil(character, xp, task, taskClasses, skills);
        setCharacter(result.character);
        setSkills(result.skills);
    }

    // ========== PROJECT MANAGEMENT FUNCTIONS ==========

    function addProject() {
        if (!newProjectName.trim()) return;
        const newProject: Project = {
            id: Date.now().toString(),
            name: newProjectName,
            color: generateRandomColor(),
            description: newProjectDesc,
        };
        setProjects([...projects, newProject]);
        setNewProjectName("");
        setNewProjectDesc("");
    }

    function deleteProject(projectId: string) {
        setProjects(projects.filter(p => p.id !== projectId));
        setTasks(tasks.map(t => (t.projectId === projectId ? { ...t, projectId: null } : t)));
    }

    // ========== TASK CLASS MANAGEMENT FUNCTIONS ==========

    function addTaskClass() {
        if (!newClassName.trim()) return;
        const newClass: TaskClass = {
            id: Date.now().toString(),
            name: newClassName,
            statType: newClassStat,
            color: generateRandomColor(),
        };
        setTaskClasses([...taskClasses, newClass]);
        setNewClassName("");
    }

    function deleteTaskClass(classId: string) {
        setTaskClasses(taskClasses.filter(c => c.id !== classId));
        setTasks(tasks.map(t => (t.classId === classId ? { ...t, classId: null } : t)));
    }

    // ========== SKILL MANAGEMENT FUNCTIONS ==========

    function addSkill() {
        if (!newSkillName.trim()) return;
        const newSkill: Skill = {
            id: Date.now().toString(),
            name: newSkillName,
            level: 1,
            progress: 0,
            color: generateRandomColor(),
        };
        setSkills([...skills, newSkill]);
        setNewSkillName("");
    }

    function deleteSkill(skillId: string) {
        setSkills(skills.filter(s => s.id !== skillId));
        setTasks(tasks.map(t => (t.skillId === skillId ? { ...t, skillId: null } : t)));
    }

    // ========== CHARACTER FUNCTIONS ==========

    function spendPoint(stat: StatType) {
        if (character.unspentPoints <= 0) return;
        const newChar = { ...character };
        newChar.unspentPoints--;
        newChar[stat] = (newChar[stat] as number) + 1;
        setCharacter(newChar);
    }

    function changeAvatar(avatar: string) {
        setCharacter({ ...character, avatar });
    }

    function changeName(name: string) {
        setCharacter({ ...character, name });
    }

    // ========== RESET FUNCTION ==========

    function resetProgress() {
        setTasks([]);
        setProjects([]);
        setTaskClasses([]);
        setSkills([]);
        setCharacter(DEFAULT_CHARACTER);
        setRecurringCompletions([]);
        setShowResetConfirm(false);
    }

    // Funkcje dla flexible tasks
    function getFlexibleTasks(): Task[] {
        return tasks.filter(t => !t.completed && t.isFlexible);
    }

    function getTodayTasks(): Task[] {
        return tasks.filter(t => !t.completed && t.dueDate === today && !t.isRecurring);
    }

    function getTomorrowTasks(): Task[] {
        return tasks.filter(t => !t.completed && t.dueDate === tomorrow && !t.isRecurring);
    }

    function getActiveRecurringTasksList(): Task[] {
        return tasks.filter(
            t => t.isRecurring && (!t.recurringEndDate || t.recurringEndDate >= today)
        );
    }

    // ========== RENDER ==========
    // Note: The JSX render logic continues in the next part...
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-2 sm:p-4">
            <div className="max-w-7xl mx-auto">
                {/* Top Bar */}
                <div className="bg-slate-800 rounded-xl shadow-xl p-3 sm:p-4 md:p-6 mb-4 border border-slate-700">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <div className="text-4xl sm:text-5xl flex-shrink-0">{character.avatar}</div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent truncate">
                                    {character.name}
                                </h1>
                                <p className="text-slate-400 text-xs sm:text-sm">Level {character.level} Adventurer</p>
                            </div>
                        </div>
                        <div className="w-full sm:w-48 md:w-64">
                            <div className="flex justify-between text-xs sm:text-sm mb-1">
                                <span className="text-slate-400">XP</span>
                                <span className="text-indigo-400 font-semibold">
                                    {character.xp} / {xpForNextLevel}
                                </span>
                            </div>
                            <ProgressBar value={character.xp} max={xpForNextLevel} />
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 mb-4">
                    {/* Mobile: Hamburger + Current View */}
                    <div className="lg:hidden flex items-center justify-between p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">
                                {view === "daily" && "📅"}
                                {view === "weekly" && "📊"}
                                {view === "monthly" && "📆"}
                                {view === "all" && "📋"}
                                {view === "projects" && "🎯"}
                                {view === "character" && "⚔️"}
                                {view === "activeTasks" && "🔥"}
                                {view === "settings" && "⚙️"}
                            </span>
                            <span className="font-semibold text-lg">
                                {view === "daily" && "Daily"}
                                {view === "weekly" && "Weekly"}
                                {view === "monthly" && "Monthly"}
                                {view === "all" && "All Tasks"}
                                {view === "projects" && "Projects"}
                                {view === "character" && "Character"}
                                {view === "activeTasks" && "Active Tasks"}
                                {view === "settings" && "Settings"}
                            </span>
                        </div>
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-700 transition"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {showMobileMenu ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {showMobileMenu && (
                        <div className="lg:hidden border-t border-slate-700 p-2 space-y-1">
                            {[
                                { id: "character", label: "Character", icon: "⚔️" },
                                { id: "activeTasks", label: "Active Tasks", icon: "🔥" },
                                { id: "daily", label: "Daily", icon: "📅" },
                                { id: "weekly", label: "Weekly", icon: "📊" },
                                { id: "monthly", label: "Monthly", icon: "📆" },
                                { id: "all", label: "All", icon: "📋" },
                                { id: "projects", label: "Projects", icon: "🎯" },
                                { id: "settings", label: "Settings", icon: "⚙️" },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setView(item.id as any);
                                        setShowMobileMenu(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${view === item.id
                                        ? "bg-indigo-600 text-white shadow-lg"
                                        : "bg-slate-900 text-slate-300 hover:bg-slate-700"
                                        }`}
                                >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Desktop: Horizontal Menu */}
                    <div className="hidden lg:block p-2 overflow-x-auto">
                        <div className="flex gap-2">
                            {[
                                { id: "character", label: "Character", icon: "⚔️" },
                                { id: "activeTasks", label: "Active Tasks", icon: "🔥" },
                                { id: "daily", label: "Daily", icon: "📅" },
                                { id: "weekly", label: "Weekly", icon: "📊" },
                                { id: "monthly", label: "Monthly", icon: "📆" },
                                { id: "all", label: "All", icon: "📋" },
                                { id: "projects", label: "Projects", icon: "🎯" },
                                { id: "settings", label: "Settings", icon: "⚙️" },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setView(item.id as any)}
                                    className={`px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${view === item.id
                                        ? "bg-indigo-600 text-white shadow-lg"
                                        : "bg-slate-900 text-slate-300 hover:bg-slate-700"
                                        }`}
                                >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Daily View */}
                {view === "daily" && (
                    <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h2 className="text-2xl font-semibold">Daily Quests</h2>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 w-full sm:w-auto"
                                />
                                <button
                                    onClick={() => openTaskModal(selectedDate)}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition w-full sm:w-auto"
                                >
                                    + Add Quest
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {dailyTasks.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <p className="text-lg mb-2">No quests for this day</p>
                                    <p className="text-sm">Click "Add Quest" to create one!</p>
                                </div>
                            ) : (
                                dailyTasks.map(task => {
                                    const isCompleted = isTaskCompletedOnDate(task, selectedDate, recurringCompletions);
                                    const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
                                    const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;
                                    const skill = task.skillId ? skills.find(s => s.id === task.skillId) : null;

                                    return (
                                        <div
                                            key={task.id}
                                            className={`bg-slate-900 rounded-lg p-3 sm:p-4 border border-slate-700 transition-all ${isCompleted ? "opacity-60" : ""
                                                }`}
                                        >
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isCompleted}
                                                    onChange={() => toggleTask(task.id, selectedDate)}
                                                    className="mt-1 w-5 h-5 sm:w-6 sm:h-6 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <h3
                                                                className={`text-base sm:text-lg font-semibold break-words ${isCompleted ? "line-through text-slate-500" : ""
                                                                    }`}
                                                            >
                                                                {task.name}
                                                            </h3>
                                                            {task.description && (
                                                                <p className="text-xs sm:text-sm text-slate-400 mt-1 break-words">{task.description}</p>
                                                            )}
                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                <span className="text-xs px-2 sm:px-3 py-1 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">
                                                                    {task.xpReward} XP
                                                                </span>
                                                                {task.priority && (
                                                                    <span
                                                                        className={`text-xs px-2 sm:px-3 py-1 rounded-full ${task.priority === "high"
                                                                            ? "bg-rose-900 text-rose-300 border border-rose-700"
                                                                            : task.priority === "medium"
                                                                                ? "bg-amber-900 text-amber-300 border border-amber-700"
                                                                                : "bg-slate-700 text-slate-300 border border-slate-600"
                                                                            }`}
                                                                    >
                                                                        {task.priority}
                                                                    </span>
                                                                )}
                                                                {project && (
                                                                    <span
                                                                        className="text-xs px-2 sm:px-3 py-1 rounded-full border"
                                                                        style={{
                                                                            borderColor: project.color,
                                                                            color: project.color,
                                                                            backgroundColor: `${project.color}20`,
                                                                        }}
                                                                    >
                                                                        {project.name}
                                                                    </span>
                                                                )}
                                                                {taskClass && (
                                                                    <span
                                                                        className="text-xs px-2 sm:px-3 py-1 rounded-full border"
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
                                                                        className="text-xs px-2 sm:px-3 py-1 rounded-full border"
                                                                        style={{
                                                                            borderColor: skill.color,
                                                                            color: skill.color,
                                                                            backgroundColor: `${skill.color}20`,
                                                                        }}
                                                                    >
                                                                        {skill.name}
                                                                    </span>
                                                                )}
                                                                {task.isRecurring && (
                                                                    <span className="text-xs px-2 sm:px-3 py-1 rounded-full bg-purple-900 text-purple-300 border border-purple-700">
                                                                        🔄 {task.recurringType}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                                                            <button
                                                                onClick={() => openEditModal(task)}
                                                                className="text-slate-400 hover:text-indigo-400 transition p-1 text-lg sm:text-xl"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => deleteTask(task.id)}
                                                                className="text-slate-400 hover:text-rose-400 transition p-1 text-lg sm:text-xl"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* Weekly View */}
                {view === "weekly" && (
                    <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">Weekly Quests</h2>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={goToPreviousWeek}
                                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 hover:bg-slate-700 transition"
                                    title="Previous week"
                                >
                                    ←
                                </button>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                />
                                <button
                                    onClick={goToNextWeek}
                                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 hover:bg-slate-700 transition"
                                    title="Next week"
                                >
                                    →
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                            {weekDates.map(date => {
                                const dayTasks = getTasksForDate(tasks, date);
                                const completedCount = dayTasks.filter(t => isTaskCompletedOnDate(t, date, recurringCompletions)).length;
                                const isToday = date === today;

                                return (
                                    <div
                                        key={date}
                                        className={`bg-slate-900 rounded-lg p-4 border ${isToday ? "border-indigo-500 ring-2 ring-indigo-500" : "border-slate-700"
                                            }`}
                                    >
                                        <div className="text-center mb-3">
                                            <p className="text-xs text-slate-400">{getDayName(date)}</p>
                                            <p className={`text-lg font-semibold ${isToday ? "text-indigo-400" : ""}`}>
                                                {formatShortDate(date)}
                                            </p>
                                            {dayTasks.length > 0 && (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {completedCount}/{dayTasks.length}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            {dayTasks.map(task => {
                                                const isCompleted = isTaskCompletedOnDate(task, date, recurringCompletions);
                                                return (
                                                    <div
                                                        key={task.id}
                                                        onClick={(e) => {
                                                            // Jeśli kliknięto checkbox, nie otwieraj modala
                                                            if ((e.target as HTMLElement).tagName !== 'INPUT') {
                                                                openEditModal(task);
                                                            }
                                                        }}
                                                        className={`text-xs p-2 rounded border border-slate-700 cursor-pointer ${isCompleted ? "bg-slate-800 opacity-60" : "bg-slate-900 hover:bg-slate-800"
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={isCompleted}
                                                                onChange={() => toggleTask(task.id, date)}
                                                                className="mt-0.5 w-3 h-3 rounded border-slate-600"
                                                            />
                                                            <span className={isCompleted ? "line-through text-slate-500" : ""}>
                                                                {task.name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => openTaskModal(date)}
                                            className="w-full mt-3 text-xs py-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Monthly View */}
                {view === "monthly" && (
                    <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">Monthly Quests</h2>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={goToPreviousMonth}
                                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 hover:bg-slate-700 transition"
                                    title="Previous month"
                                >
                                    ←
                                </button>
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                />
                                <button
                                    onClick={goToNextMonth}
                                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 hover:bg-slate-700 transition"
                                    title="Next month"
                                >
                                    →
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-slate-400 mb-2">
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                                    <div key={day}>{day}</div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {monthDates.map((date, idx) => {
                                if (!date)
                                    return <div key={`empty-${idx}`} className="aspect-square bg-slate-900 rounded-lg" />;

                                const dayTasks = getTasksForDate(tasks, date);
                                const completedCount = dayTasks.filter(t => isTaskCompletedOnDate(t, date, recurringCompletions)).length;
                                const isToday = date === today;

                                return (
                                    <div
                                        key={date}
                                        className={`aspect-square bg-slate-900 rounded-lg p-2 border flex flex-col ${isToday ? "border-indigo-500 ring-2 ring-indigo-500" : "border-slate-700"
                                            }`}
                                    >
                                        <div className={`text-sm font-semibold mb-1 ${isToday ? "text-indigo-400" : ""}`}>
                                            {date.split("-")[2]}
                                        </div>
                                        <div className="flex-1 space-y-1 overflow-y-auto">
                                            {dayTasks.slice(0, 2).map(task => {
                                                const isCompleted = isTaskCompletedOnDate(task, date, recurringCompletions);
                                                return (
                                                    <div
                                                        key={task.id}
                                                        onClick={() => openEditModal(task)}
                                                        className={`text-xs truncate cursor-pointer hover:text-indigo-400 transition ${isCompleted ? "line-through text-slate-500" : "text-slate-300"
                                                            }`}
                                                    >
                                                        {task.name}
                                                    </div>
                                                );
                                            })}
                                            {dayTasks.length > 2 && (
                                                <div className="text-xs text-slate-500">+{dayTasks.length - 2}</div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => openTaskModal(date)}
                                            className="w-full mt-3 text-xs py-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700"
                                        >
                                            + Add
                                        </button>

                                        {dayTasks.length > 0 && (
                                            <div className="text-xs text-slate-400 mt-1">
                                                {completedCount}/{dayTasks.length}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* All Tasks View */}
                {view === "all" && (
                    <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">All Quests</h2>
                            <button
                                onClick={() => openTaskModal()}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                            >
                                + Add Quest
                            </button>
                        </div>

                        <div className="space-y-3">
                            {sortedTasks.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <p className="text-lg mb-2">No quests yet</p>
                                    <p className="text-sm">Start your adventure by creating your first quest!</p>
                                </div>
                            ) : (
                                sortedTasks.map(task => {
                                    const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
                                    const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;
                                    const skill = task.skillId ? skills.find(s => s.id === task.skillId) : null;

                                    return (
                                        <div
                                            key={task.id}
                                            className={`bg-slate-900 rounded-lg p-4 border border-slate-700 transition-all ${task.completed ? "opacity-60 cursor-pointer hover:opacity-80" : ""
                                                }`}
                                            onClick={() => task.completed && openCompletedTaskView(task)} // NOWE: kliknięcie na ukończone zadanie
                                        >
                                            <div className="flex items-start gap-4">
                                                <input
                                                    type="checkbox"
                                                    checked={task.completed}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        toggleTask(task.id);
                                                    }}
                                                    className="mt-1 w-5 h-5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3
                                                                className={`text-lg font-semibold ${task.completed ? "line-through text-slate-500" : ""
                                                                    }`}
                                                            >
                                                                {task.name}
                                                            </h3>
                                                            {task.description && (
                                                                <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                                                            )}
                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                <span className="text-xs px-3 py-1 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">
                                                                    {task.xpReward} XP
                                                                </span>
                                                                {task.priority && (
                                                                    <span
                                                                        className={`text-xs px-3 py-1 rounded-full ${task.priority === "high"
                                                                            ? "bg-rose-900 text-rose-300 border border-rose-700"
                                                                            : task.priority === "medium"
                                                                                ? "bg-amber-900 text-amber-300 border border-amber-700"
                                                                                : "bg-slate-700 text-slate-300 border border-slate-600"
                                                                            }`}
                                                                    >
                                                                        {task.priority}
                                                                    </span>
                                                                )}
                                                                {task.dueDate && (
                                                                    <span className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                                                                        📅 {task.dueDate}
                                                                    </span>
                                                                )}
                                                                {task.isFlexible && (
                                                                    <span className="text-xs px-3 py-1 rounded-full bg-teal-900 text-teal-300 border border-teal-700">
                                                                        🕐 Flexible
                                                                    </span>
                                                                )}
                                                                {project && (
                                                                    <span
                                                                        className="text-xs px-3 py-1 rounded-full border"
                                                                        style={{
                                                                            borderColor: project.color,
                                                                            color: project.color,
                                                                            backgroundColor: `${project.color}20`,
                                                                        }}
                                                                    >
                                                                        {project.name}
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
                                                                {task.isRecurring && (
                                                                    <span className="text-xs px-3 py-1 rounded-full bg-purple-900 text-purple-300 border border-purple-700">
                                                                        🔄 {task.recurringType}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 ml-4">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openEditModal(task);
                                                                }}
                                                                className="text-slate-400 hover:text-indigo-400 transition"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteTask(task.id);
                                                                }}
                                                                className="text-slate-400 hover:text-rose-400 transition"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* NOWE: Active Tasks View */}
                {view === "activeTasks" && (
                    <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-semibold">🔥 Active Tasks</h2>
                                <p className="text-sm text-slate-400 mt-1">Today's tasks, recurring tasks, flexible tasks, and tomorrow's planning</p>
                            </div>
                            <button
                                onClick={() => openTaskModal()}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                            >
                                + Add Quest
                            </button>
                        </div>

                        {/* Dzisiejsze zadania - BEZ zadań powtarzalnych które są aktywne cały czas */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-indigo-400">📅 Today ({formatShortDate(today)})</h3>
                            <div className="space-y-3">
                                {tasks.filter(t => !t.completed && t.dueDate === today && !t.isRecurring).length === 0 ? (
                                    <p className="text-slate-400 text-sm">No tasks for today</p>
                                ) : (
                                    tasks.filter(t => !t.completed && t.dueDate === today && !t.isRecurring).map(task => {
                                        const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
                                        const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;
                                        const skill = task.skillId ? skills.find(s => s.id === task.skillId) : null;

                                        return (
                                            <div key={task.id} onClick={(e) => {
                                                if ((e.target as HTMLElement).tagName !== 'INPUT') {
                                                    openEditModal(task);
                                                }
                                            }} className="bg-slate-900 rounded-lg p-4 border border-slate-700 cursor-pointer hover:border-slate-600 transition">
                                                <div className="flex items-start gap-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={task.completed}
                                                        onChange={() => toggleTask(task.id, today)}
                                                        className="mt-1 w-5 h-5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold">{task.name}</h3>
                                                        {task.description && (
                                                            <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                                                        )}
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            <span className="text-xs px-3 py-1 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">
                                                                {task.xpReward} XP
                                                            </span>
                                                            {task.priority && (
                                                                <span
                                                                    className={`text-xs px-3 py-1 rounded-full ${task.priority === "high"
                                                                        ? "bg-rose-900 text-rose-300 border border-rose-700"
                                                                        : task.priority === "medium"
                                                                            ? "bg-amber-900 text-amber-300 border border-amber-700"
                                                                            : "bg-slate-700 text-slate-300 border border-slate-600"
                                                                        }`}
                                                                >
                                                                    {task.priority}
                                                                </span>
                                                            )}
                                                            {project && (
                                                                <span
                                                                    className="text-xs px-3 py-1 rounded-full border"
                                                                    style={{
                                                                        borderColor: project.color,
                                                                        color: project.color,
                                                                        backgroundColor: `${project.color}20`,
                                                                    }}
                                                                >
                                                                    {project.name}
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
                                    })
                                )}
                            </div>
                        </div>

                        {/* NOWE: Zadania powtarzalne - aktywne cały czas (bez końca lub jeszcze nieukończone) */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-purple-400">🔄 Recurring Tasks</h3>
                            <div className="space-y-3">
                                {tasks.filter(t => t.isRecurring && (!t.recurringEndDate || t.recurringEndDate >= today)).length === 0 ? (
                                    <p className="text-slate-400 text-sm">No active recurring tasks</p>
                                ) : (
                                    tasks.filter(t => t.isRecurring && (!t.recurringEndDate || t.recurringEndDate >= today)).map(task => {
                                        const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
                                        const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;
                                        const skill = task.skillId ? skills.find(s => s.id === task.skillId) : null;
                                        const isCompletedToday = isTaskCompletedOnDate(task, today, recurringCompletions);

                                        return (
                                            <div key={task.id} onClick={(e) => {
                                                if ((e.target as HTMLElement).tagName !== 'INPUT') {
                                                    openEditModal(task);
                                                }
                                            }} className={`bg-slate-900 rounded-lg p-4 border cursor-pointer transition ${isCompletedToday ? 'border-purple-700 opacity-60' : 'border-purple-700 hover:border-purple-600'}`}>
                                                <div className="flex items-start gap-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isCompletedToday}
                                                        onChange={() => toggleTask(task.id, today)}
                                                        className="mt-1 w-5 h-5 rounded border-slate-600 text-purple-600 focus:ring-purple-500"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className={`text-lg font-semibold ${isCompletedToday ? 'line-through text-slate-500' : ''}`}>{task.name}</h3>
                                                        {task.description && (
                                                            <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                                                        )}
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            <span className="text-xs px-3 py-1 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">
                                                                {task.xpReward} XP
                                                            </span>
                                                            <span className="text-xs px-3 py-1 rounded-full bg-purple-900 text-purple-300 border border-purple-700">
                                                                🔄 {task.recurringType}
                                                                {task.recurringEndDate && ` (until ${formatShortDate(task.recurringEndDate)})`}
                                                            </span>
                                                            {task.priority && (
                                                                <span
                                                                    className={`text-xs px-3 py-1 rounded-full ${task.priority === "high"
                                                                        ? "bg-rose-900 text-rose-300 border border-rose-700"
                                                                        : task.priority === "medium"
                                                                            ? "bg-amber-900 text-amber-300 border border-amber-700"
                                                                            : "bg-slate-700 text-slate-300 border border-slate-600"
                                                                        }`}
                                                                >
                                                                    {task.priority}
                                                                </span>
                                                            )}
                                                            {project && (
                                                                <span
                                                                    className="text-xs px-3 py-1 rounded-full border"
                                                                    style={{
                                                                        borderColor: project.color,
                                                                        color: project.color,
                                                                        backgroundColor: `${project.color}20`,
                                                                    }}
                                                                >
                                                                    {project.name}
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
                                    })
                                )}
                            </div>
                        </div>

                        {/* Flexible tasks (bez due date) */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-teal-400">🕐 Flexible Tasks</h3>
                            <div className="space-y-3">
                                {tasks.filter(t => !t.completed && t.isFlexible).length === 0 ? (
                                    <p className="text-slate-400 text-sm">No flexible tasks</p>
                                ) : (
                                    tasks.filter(t => !t.completed && t.isFlexible).map(task => {
                                        const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
                                        const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;
                                        const skill = task.skillId ? skills.find(s => s.id === task.skillId) : null;

                                        return (
                                            <div key={task.id} onClick={(e) => {
                                                if ((e.target as HTMLElement).tagName !== 'INPUT') {
                                                    openEditModal(task);
                                                }
                                            }} className="bg-slate-900 rounded-lg p-4 border border-teal-700 cursor-pointer hover:border-teal-600 transition">
                                                <div className="flex items-start gap-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={task.completed}
                                                        onChange={() => toggleTask(task.id, today)}
                                                        className="mt-1 w-5 h-5 rounded border-slate-600 text-teal-600 focus:ring-teal-500"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold">{task.name}</h3>
                                                        {task.description && (
                                                            <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                                                        )}
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            <span className="text-xs px-3 py-1 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">
                                                                {task.xpReward} XP
                                                            </span>
                                                            <span className="text-xs px-3 py-1 rounded-full bg-teal-900 text-teal-300 border border-teal-700">
                                                                🕐 No deadline
                                                            </span>
                                                            {task.priority && (
                                                                <span
                                                                    className={`text-xs px-3 py-1 rounded-full ${task.priority === "high"
                                                                        ? "bg-rose-900 text-rose-300 border border-rose-700"
                                                                        : task.priority === "medium"
                                                                            ? "bg-amber-900 text-amber-300 border border-amber-700"
                                                                            : "bg-slate-700 text-slate-300 border border-slate-600"
                                                                        }`}
                                                                >
                                                                    {task.priority}
                                                                </span>
                                                            )}
                                                            {project && (
                                                                <span
                                                                    className="text-xs px-3 py-1 rounded-full border"
                                                                    style={{
                                                                        borderColor: project.color,
                                                                        color: project.color,
                                                                        backgroundColor: `${project.color}20`,
                                                                    }}
                                                                >
                                                                    {project.name}
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
                                    })
                                )}
                            </div>
                        </div>

                        {/* Jutrzejsze zadania - BEZ zadań powtarzalnych */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-purple-400">🌅 Tomorrow ({formatShortDate(tomorrow)})</h3>
                            <div className="space-y-3">
                                {tasks.filter(t => !t.completed && t.dueDate === tomorrow && !t.isRecurring).length === 0 ? (
                                    <p className="text-slate-400 text-sm">No tasks scheduled for tomorrow</p>
                                ) : (
                                    tasks.filter(t => !t.completed && t.dueDate === tomorrow && !t.isRecurring).map(task => {
                                        const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
                                        const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;
                                        const skill = task.skillId ? skills.find(s => s.id === task.skillId) : null;

                                        return (
                                            <div key={task.id} onClick={() => openEditModal(task)} className="bg-slate-900 rounded-lg p-4 border border-slate-700 opacity-75 cursor-pointer hover:opacity-100 hover:border-slate-600 transition">
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-1 w-5 h-5 rounded border-2 border-slate-600" />
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold">{task.name}</h3>
                                                        {task.description && (
                                                            <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                                                        )}
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            <span className="text-xs px-3 py-1 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">
                                                                {task.xpReward} XP
                                                            </span>
                                                            {task.priority && (
                                                                <span
                                                                    className={`text-xs px-3 py-1 rounded-full ${task.priority === "high"
                                                                        ? "bg-rose-900 text-rose-300 border border-rose-700"
                                                                        : task.priority === "medium"
                                                                            ? "bg-amber-900 text-amber-300 border border-amber-700"
                                                                            : "bg-slate-700 text-slate-300 border border-slate-600"
                                                                        }`}
                                                                >
                                                                    {task.priority}
                                                                </span>
                                                            )}
                                                            {project && (
                                                                <span
                                                                    className="text-xs px-3 py-1 rounded-full border"
                                                                    style={{
                                                                        borderColor: project.color,
                                                                        color: project.color,
                                                                        backgroundColor: `${project.color}20`,
                                                                    }}
                                                                >
                                                                    {project.name}
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
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Character View */}
                {view === "character" && (
                    <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
                        <h2 className="text-2xl font-semibold mb-6">Character Profile</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <div className="bg-slate-900 rounded-lg p-4 sm:p-6 border border-slate-700">
                                <div className="flex items-center gap-3 sm:gap-4 mb-6">
                                    <div className="text-5xl sm:text-6xl flex-shrink-0">{character.avatar}</div>
                                    <div className="flex-1 min-w-0">
                                        <input
                                            type="text"
                                            value={character.name}
                                            onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                                            className="w-full text-xl sm:text-2xl font-bold bg-transparent border-b-2 border-slate-700 focus:border-indigo-500 outline-none pb-1"
                                        />
                                        <p className="text-slate-400 mt-1 text-sm sm:text-base">Level {character.level}</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                                        <span>XP Progress</span>
                                        <span className="text-indigo-400">
                                            {character.xp} / {xpForNextLevel}
                                        </span>
                                    </div>
                                    <ProgressBar value={character.xp} max={xpForNextLevel} />
                                </div>

                                <div className="grid grid-cols-4 gap-2 mb-6">
                                    {AVATARS.map(avatar => (
                                        <button
                                            key={avatar}
                                            onClick={() => setCharacter({ ...character, avatar })}
                                            className={`text-3xl sm:text-4xl p-2 sm:p-3 rounded-lg transition ${character.avatar === avatar
                                                ? "bg-indigo-900 border-2 border-indigo-500"
                                                : "bg-slate-800 hover:bg-slate-700 border-2 border-transparent"
                                                }`}
                                        >
                                            {avatar}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                                    <div className="flex justify-between">
                                        <span>Total XP Earned:</span>
                                        <span className="text-indigo-400 font-semibold">{character.totalXp}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Quests:</span>
                                        <span className="text-indigo-400 font-semibold">{tasks.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Completed:</span>
                                        <span className="text-indigo-400 font-semibold">
                                            {tasks.filter(t => t.completed).length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-lg p-4 sm:p-6 border border-slate-700">
                                <h3 className="text-lg sm:text-xl font-semibold mb-4">Stats</h3>
                                <div className="space-y-4">
                                    {[
                                        { name: "Strength", key: "strength", icon: "💪" },
                                        { name: "Endurance", key: "endurance", icon: "🏃" },
                                        { name: "Intelligence", key: "intelligence", icon: "🧠" },
                                        { name: "Agility", key: "agility", icon: "⚡" },
                                        { name: "Charisma", key: "charisma", icon: "✨" },
                                    ].map(stat => {
                                        const value = character[stat.key as keyof Character] as number;
                                        const progress = character[`${stat.key}Progress` as keyof Character] as number;
                                        return (
                                            <div key={stat.key}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs sm:text-sm">
                                                            {stat.icon} {stat.name}
                                                        </span>
                                                        <button
                                                            onClick={() => setShowStatInfo(stat.key)}
                                                            className="w-5 h-5 rounded-full bg-slate-800 border border-slate-600 hover:border-indigo-500 transition flex items-center justify-center text-xs"
                                                            title="Info"
                                                        >
                                                            ℹ️
                                                        </button>
                                                    </div>
                                                    <span className="text-base sm:text-lg font-bold text-indigo-400">{value}</span>
                                                </div>
                                                <ProgressBar value={progress} max={value + 1} />
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {progress}/{value + 1} tasks to level up
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 mt-6">
                            <h3 className="text-lg font-semibold mb-3">Skills Management</h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Create custom skills to track your personal growth. Assign skills to tasks to level them up!
                            </p>

                            <div className="flex gap-3 mb-4">
                                <input
                                    type="text"
                                    placeholder="Skill name (e.g. Cooking, Guitar)"
                                    value={newSkillName}
                                    onChange={(e) => setNewSkillName(e.target.value)}
                                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                                />
                                <button
                                    onClick={addSkill}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                                >
                                    Add Skill
                                </button>
                            </div>

                            <div className="space-y-3">
                                {skills.length > 0 ? (
                                    skills.map(s => (
                                        <div
                                            key={s.id}
                                            className="bg-slate-800 rounded-lg p-4 border border-slate-700"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                                                        style={{ background: s.color }}
                                                    >
                                                        {s.name[0]}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-100">{s.name}</h4>
                                                        <p className="text-xs text-slate-400">Level {s.level}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteSkill(s.id)}
                                                    className="text-rose-500 hover:text-rose-400"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1">
                                                    Progress to next level
                                                </p>
                                                <ProgressBar value={s.progress} max={s.level + 1} />
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {s.progress}/{s.level + 1} tasks completed
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
                    </div>
                )}

                {/* Settings View */}
                {view === "settings" && (
                    <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">Settings</h2>
                            {/* NOWE: Ikona informacyjna */}
                            <button
                                onClick={() => setShowInfoPopup(true)}
                                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 hover:border-indigo-500 transition flex items-center justify-center text-xl"
                                title="Information"
                            >
                                ℹ️
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-rose-900 rounded-xl p-6 border border-rose-700">
                                <h3 className="text-xl font-semibold text-rose-100 mb-2">Danger Zone</h3>
                                <p className="text-rose-200 text-sm mb-4">
                                    Reset all progress and start fresh. This action cannot be undone.
                                </p>
                                <button
                                    onClick={() => setShowResetConfirm(true)}
                                    className="bg-rose-700 hover:bg-rose-600 text-white px-6 py-3 rounded-lg"
                                >
                                    Reset All Progress
                                </button>
                            </div>

                            {showResetConfirm && (
                                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
                                        <h3 className="text-2xl font-semibold mb-4 text-rose-400">⚠️ Confirm Reset</h3>
                                        <p className="text-slate-300 mb-6">
                                            Are you sure you want to reset all progress? This will delete all tasks,
                                            projects, classes, skills and stats.
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={resetProgress}
                                                className="flex-1 bg-rose-700 hover:bg-rose-600 text-white px-6 py-3 rounded-lg"
                                            >
                                                Yes, Reset Everything
                                            </button>
                                            <button
                                                onClick={() => setShowResetConfirm(false)}
                                                className="flex-1 bg-slate-900 text-slate-300 px-6 py-3 rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Projects View */}
                {view === "projects" && (
                    <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
                        <h2 className="text-2xl font-semibold mb-6">Projects & Classes</h2>

                        <div className="bg-slate-900 rounded-lg p-4 mb-6 border border-slate-700">
                            <h3 className="text-lg font-semibold mb-3">Create New Project</h3>
                            <div className="space-y-3">
                                <input type="text" placeholder="Project name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100" />
                                <input type="text" placeholder="Description" value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100" />
                                <div className="flex gap-3">
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
                                <select value={newClassStat} onChange={(e) => setNewClassStat(e.target.value as "strength" | "endurance" | "intelligence" | "agility" | "charisma")} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100">
                                    <option value="strength">Strength</option>
                                    <option value="endurance">Endurance</option>
                                    <option value="intelligence">Intelligence</option>
                                    <option value="agility">Agility</option>
                                    <option value="charisma">Charisma</option>
                                </select>
                                <div className="flex gap-2 items-center">
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

                {/* Task Creation/Edit Modal */}
                {showTaskModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700 my-8 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-2xl font-semibold mb-6">
                                {editingTask ? "Edit Quest" : "Create New Quest"}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Quest Name</label>
                                    <input
                                        type="text"
                                        value={taskName}
                                        onChange={(e) => setTaskName(e.target.value)}
                                        placeholder="Enter quest name..."
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={taskDescription}
                                        onChange={(e) => setTaskDescription(e.target.value)}
                                        placeholder="Quest details..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Priority</label>
                                        <select
                                            value={taskPriority}
                                            onChange={(e) => setTaskPriority(e.target.value as "low" | "medium" | "high")}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">XP Reward</label>
                                        <input
                                            type="number"
                                            value={taskXpReward}
                                            onChange={(e) => setTaskXpReward(Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                        />
                                    </div>
                                </div>

                                {/* NOWE: Checkbox dla Flexible Task */}
                                <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-lg border border-slate-700">
                                    <input
                                        type="checkbox"
                                        id="flexibleTask"
                                        checked={taskIsFlexible}
                                        onChange={(e) => setTaskIsFlexible(e.target.checked)}
                                        className="w-5 h-5 rounded border-slate-600 text-teal-600 focus:ring-teal-500"
                                    />
                                    <label htmlFor="flexibleTask" className="text-sm font-medium cursor-pointer">
                                        🕐 Flexible Task (no due date) - Due date will be set when completed
                                    </label>
                                </div>

                                {/* Due Date - ukryte gdy flexible */}
                                {!taskIsFlexible && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Due Date</label>
                                        <input
                                            type="date"
                                            value={taskDueDate}
                                            onChange={(e) => setTaskDueDate(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2">Project (Optional)</label>
                                    <select
                                        value={taskProjectId}
                                        onChange={(e) => setTaskProjectId(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                    >
                                        <option value="">No Project</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Task Class (Optional)</label>
                                    <select
                                        value={taskClassId}
                                        onChange={(e) => setTaskClassId(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                    >
                                        <option value="">No Class</option>
                                        {taskClasses.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.statType})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Skill (Optional)</label>
                                    <select
                                        value={taskSkillId}
                                        onChange={(e) => setTaskSkillId(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                    >
                                        <option value="">No Skill</option>
                                        {skills.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} (Lvl {s.level})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-lg border border-slate-700">
                                    <input
                                        type="checkbox"
                                        id="recurringTask"
                                        checked={taskIsRecurring}
                                        onChange={(e) => setTaskIsRecurring(e.target.checked)}
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
                                                onChange={(e) => setTaskRecurringType(e.target.value as "daily" | "weekly" | "monthly")}
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
                                                    onChange={(e) => setTaskRecurringDay(Number(e.target.value))}
                                                    min={1}
                                                    max={taskRecurringType === "weekly" ? 7 : 31}
                                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                                />
                                            </div>
                                        )}

                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium mb-2">
                                                End Date (Optional) - Leave empty for infinite recurring
                                            </label>
                                            <input
                                                type="date"
                                                value={taskRecurringEndDate}
                                                onChange={(e) => setTaskRecurringEndDate(e.target.value)}
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
                )}

                {/* NOWE: Modal podglądu ukończonego zadania */}
                {showCompletedTaskModal && viewingTask && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700 my-8">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-2xl font-semibold">✅ Completed Quest</h3>
                                <button
                                    onClick={() => setShowCompletedTaskModal(false)}
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
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Priority</label>
                                        <span
                                            className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${viewingTask.priority === "high"
                                                ? "bg-rose-900 text-rose-300 border border-rose-700"
                                                : viewingTask.priority === "medium"
                                                    ? "bg-amber-900 text-amber-300 border border-amber-700"
                                                    : "bg-slate-700 text-slate-300 border border-slate-600"
                                                }`}
                                        >
                                            {viewingTask.priority}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">XP Earned</label>
                                        <span className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-indigo-900 text-indigo-300 border border-indigo-700">
                                            {viewingTask.xpReward} XP
                                        </span>
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

                                {viewingTask.projectId && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Project</label>
                                        <span
                                            className="inline-block px-4 py-2 rounded-lg text-sm font-medium border"
                                            style={{
                                                borderColor: projects.find(p => p.id === viewingTask.projectId)?.color,
                                                color: projects.find(p => p.id === viewingTask.projectId)?.color,
                                                backgroundColor: `${projects.find(p => p.id === viewingTask.projectId)?.color}20`,
                                            }}
                                        >
                                            {projects.find(p => p.id === viewingTask.projectId)?.name}
                                        </span>
                                    </div>
                                )}

                                {viewingTask.classId && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Task Class</label>
                                        <span
                                            className="inline-block px-4 py-2 rounded-lg text-sm font-medium border"
                                            style={{
                                                borderColor: taskClasses.find(c => c.id === viewingTask.classId)?.color,
                                                color: taskClasses.find(c => c.id === viewingTask.classId)?.color,
                                                backgroundColor: `${taskClasses.find(c => c.id === viewingTask.classId)?.color}20`,
                                            }}
                                        >
                                            {taskClasses.find(c => c.id === viewingTask.classId)?.name} (
                                            {taskClasses.find(c => c.id === viewingTask.classId)?.statType})
                                        </span>
                                    </div>
                                )}

                                {viewingTask.skillId && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Skill</label>
                                        <span
                                            className="inline-block px-4 py-2 rounded-lg text-sm font-medium border"
                                            style={{
                                                borderColor: skills.find(s => s.id === viewingTask.skillId)?.color,
                                                color: skills.find(s => s.id === viewingTask.skillId)?.color,
                                                backgroundColor: `${skills.find(s => s.id === viewingTask.skillId)?.color}20`,
                                            }}
                                        >
                                            {skills.find(s => s.id === viewingTask.skillId)?.name}
                                        </span>
                                    </div>
                                )}

                                {viewingTask.isRecurring && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Recurring</label>
                                        <span className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-purple-900 text-purple-300 border border-purple-700">
                                            🔄 {viewingTask.recurringType}
                                            {viewingTask.recurringEndDate && ` (ends: ${formatShortDate(viewingTask.recurringEndDate)})`}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCompletedTaskModal(false)}
                                    className="w-full bg-slate-900 text-slate-300 px-6 py-3 rounded-lg hover:bg-slate-700 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* NOWE: Modal z opisem statystyk */}
                {showStatInfo && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-semibold capitalize">
                                    {showStatInfo === "strength" && "💪"}
                                    {showStatInfo === "endurance" && "🏃"}
                                    {showStatInfo === "intelligence" && "🧠"}
                                    {showStatInfo === "agility" && "⚡"}
                                    {showStatInfo === "charisma" && "✨"}
                                    {" "}{showStatInfo}
                                </h3>
                                <button
                                    onClick={() => setShowStatInfo(null)}
                                    className="text-slate-400 hover:text-slate-200 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {statDescriptions[showStatInfo as keyof typeof statDescriptions]}
                            </p>
                            <button
                                onClick={() => setShowStatInfo(null)}
                                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                )}

                {/* NOWE: Info Popup */}
                {showInfoPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700 my-8">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-2xl font-semibold">ℹ️ Information</h3>
                                <button
                                    onClick={() => setShowInfoPopup(false)}
                                    className="text-slate-400 hover:text-slate-200 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-semibold mb-2 text-indigo-400">About TaskQuest</h4>
                                    <p className="text-slate-300 text-sm">
                                        TaskQuest is a gamified task management application that turns your daily tasks
                                        into an RPG adventure. Complete quests, earn XP, level up your character, and
                                        develop your skills!
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-lg font-semibold mb-2 text-indigo-400">Creator</h4>
                                    <p className="text-slate-300 text-sm">
                                        Created with ❤️ by [Your Name]
                                    </p>
                                    <p className="text-slate-400 text-xs mt-1">
                                        Version 2.0 - October 2025
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-lg font-semibold mb-2 text-indigo-400">Privacy Policy</h4>
                                    <p className="text-slate-300 text-sm">
                                        All your data is stored locally in your browser using localStorage. We do not
                                        collect, transmit, or store any of your personal information on external servers.
                                        Your tasks, character progress, and settings remain completely private and under
                                        your control.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-lg font-semibold mb-2 text-indigo-400">Features</h4>
                                    <ul className="text-slate-300 text-sm space-y-1">
                                        <li>• Daily, Weekly, and Monthly task views</li>
                                        <li>• RPG-style character progression</li>
                                        <li>• Custom skills and task classes</li>
                                        <li>• Project management</li>
                                        <li>• Flexible tasks without deadlines</li>
                                        <li>• Recurring tasks support</li>
                                        <li>• Active Tasks overview</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={() => setShowInfoPopup(false)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition"
                                >
                                    Got it!
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
