import { useEffect, useState } from "react";

/**
 * Professional-styled Task Quest app (updated)
 * - Full app: daily/weekly/monthly/all/projects/settings
 * - Stats: strength / dexterity / intelligence with n+1 progression
 * - Task class mapping to stats
 * - Skills system (user-created skills, assignable to tasks, progress/levels)
 * - NEW: Completed task preview in All view
 * - NEW: Flexible tasks (no due date)
 * - NEW: Active Tasks view
 * - NEW: Info popup in Settings
 * - Persistence: localStorage
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
    dueDate: string; // może być pusty string dla flexible tasks
    subtasks: SubTask[];
    createdAt: string;
    completedAt?: string; // NOWE: data zakończenia zadania
    isRecurring?: boolean;
    recurringType?: "daily" | "weekly" | "monthly";
    recurringDay?: number;
    statType?: "strength" | "endurance" | "intelligence" | "agility" | "charisma" | null;
    classId?: string | null;
    skillId?: string | null;
    isFlexible?: boolean; // NOWE: zadania bez due date
};

type Character = {
    name: string;
    level: number;
    xp: number;
    totalXp: number;
    avatar: string;
    strength: number;
    strengthProgress: number;
    endurance: number;
    enduranceProgress: number;
    intelligence: number;
    intelligenceProgress: number;
    agility: number;
    agilityProgress: number;
    charisma: number;
    charismaProgress: number;
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
    statType: "strength" | "endurance" | "intelligence" | "agility" | "charisma";
    color?: string;
};

type Skill = {
    id: string;
    name: string;
    level: number;
    progress: number;
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

// NOWA FUNKCJA: Formatowanie daty do DD.MM
function formatShortDate(dateStr: string): string {
    if (!dateStr) return "";
    const [, month, day] = dateStr.split("-");
    return `${day}.${month}`;
}

// NOWA FUNKCJA: Formatowanie pełnej daty z godziną
function formatFullDateTime(dateStr: string): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/* -----------------------------
   Utility Components
   ----------------------------- */
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

/* -----------------------------
   Main App
   ----------------------------- */
export default function App() {
    //const [view, setView] = useState<"daily" | "weekly" | "monthly" | "all" | "projects" | "character" | "settings" | "activeTasks">("character");
    const [view, setView] = useState<"character" | "activeTasks" | "daily" | "weekly" | "monthly" | "all" | "projects" | "settings">("character");
    const [tasks, setTasks] = usePersistedState<Task[]>("tasks", []);
    const [projects, setProjects] = usePersistedState<Project[]>("projects", []);
    const [taskClasses, setTaskClasses] = usePersistedState<TaskClass[]>("taskClasses", []);
    const [skills, setSkills] = usePersistedState<Skill[]>("skills", []);

    const [character, setCharacter] = usePersistedState<Character>("character", {
        name: "Adventurer",
        level: 1,
        xp: 0,
        totalXp: 0,
        avatar: "⚔️",
        strength: 1,
        strengthProgress: 0,
        endurance: 1,
        enduranceProgress: 0,
        intelligence: 1,
        intelligenceProgress: 0,
        agility: 1,
        agilityProgress: 0,
        charisma: 1,
        charismaProgress: 0,
        unspentPoints: 0,
    });

    const [recurringCompletions, setRecurringCompletions] = usePersistedState<RecurringTaskCompletion[]>("recurringCompletions", []);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showCompletedTaskModal, setShowCompletedTaskModal] = useState(false); // NOWE: modal dla podglądu
    const [viewingTask, setViewingTask] = useState<Task | null>(null); // NOWE: zadanie do podglądu
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showInfoPopup, setShowInfoPopup] = useState(false); // NOWE: popup z informacjami
    const [showMobileMenu, setShowMobileMenu] = useState(false); // NOWE: mobile menu

    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
    const [taskDueDate, setTaskDueDate] = useState("");
    const [taskXpReward, setTaskXpReward] = useState(50);
    const [taskProjectId, setTaskProjectId] = useState<string>("");
    const [taskIsRecurring, setTaskIsRecurring] = useState(false);
    const [taskRecurringType, setTaskRecurringType] = useState<"daily" | "weekly" | "monthly">("daily");
    const [taskRecurringDay, setTaskRecurringDay] = useState<number>(1);
    const [taskClassId, setTaskClassId] = useState<string>("");
    const [taskSkillId, setTaskSkillId] = useState<string>("");
    const [taskIsFlexible, setTaskIsFlexible] = useState(false); // NOWE: checkbox dla flexible task

    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");

    const [newClassName, setNewClassName] = useState("");
    const [newClassStat, setNewClassStat] = useState<"strength" | "endurance" | "intelligence" | "agility" | "charisma">("strength");

    const [newSkillName, setNewSkillName] = useState("");

    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().slice(0, 10);

    // NOWE: Helper do pobierania aktywnych zadań (dzisiaj, jutro, flexible)


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
        setTaskClassId("");
        setTaskSkillId("");
        setTaskIsFlexible(false); // NOWE: reset flexible
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
        setTaskClassId(task.classId || "");
        setTaskSkillId(task.skillId || "");
        setTaskIsFlexible(task.isFlexible || false); // NOWE
        setShowTaskModal(true);
    }

    // NOWE: Funkcja do otwierania podglądu ukończonego zadania
    function openCompletedTaskView(task: Task) {
        setViewingTask(task);
        setShowCompletedTaskModal(true);
    }

    function closeTaskModal() {
        setShowTaskModal(false);
        setEditingTask(null);
    }

    function saveTask() {
        if (!taskName.trim()) return;

        const taskData: Task = {
            id: editingTask?.id || Date.now().toString(),
            projectId: taskProjectId || null,
            name: taskName,
            description: taskDescription,
            completed: editingTask?.completed || false,
            completedAt: editingTask?.completedAt, // NOWE: zachowaj completedAt
            xpReward: taskXpReward,
            priority: taskPriority,
            dueDate: taskIsFlexible ? "" : taskDueDate, // NOWE: puste due date dla flexible
            subtasks: editingTask?.subtasks || [],
            createdAt: editingTask?.createdAt || new Date().toISOString(),
            isRecurring: taskIsRecurring,
            recurringType: taskIsRecurring ? taskRecurringType : undefined,
            recurringDay: taskIsRecurring && taskRecurringType !== "daily" ? taskRecurringDay : undefined,
            classId: taskClassId || null,
            skillId: taskSkillId || null,
            isFlexible: taskIsFlexible, // NOWE
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
            const existing = recurringCompletions.find(rc => rc.taskId === taskId && rc.date === date);
            if (existing) {
                setRecurringCompletions(recurringCompletions.map(rc => rc.taskId === taskId && rc.date === date ? { ...rc, completed: !rc.completed } : rc));
            } else {
                setRecurringCompletions([...recurringCompletions, { taskId, date, completed: true }]);
            }

            const isCompleting = !existing?.completed;
            if (isCompleting) {
                awardXP(task.xpReward, task);
            }
        } else {
            const wasCompleted = task.completed;
            const updatedTask = {
                ...task,
                completed: !task.completed,
                completedAt: !task.completed ? new Date().toISOString() : undefined, // NOWE: zapisz datę zakończenia
                dueDate: task.isFlexible && !task.completed ? date || today : task.dueDate // NOWE: ustaw due date dla flexible przy zakończeniu
            };
            setTasks(tasks.map(t => (t.id === taskId ? updatedTask : t)));

            if (!wasCompleted) {
                awardXP(task.xpReward, task);
            }
        }
    }

    function awardXP(xp: number, task: Task) {
        let newChar = { ...character };
        newChar.xp += xp;
        newChar.totalXp += xp;

        while (newChar.xp >= calculateXpForLevel(newChar.level)) {
            newChar.xp -= calculateXpForLevel(newChar.level);
            newChar.level++;
            newChar.unspentPoints++;
        }

        if (task.classId) {
            const taskClass = taskClasses.find(c => c.id === task.classId);
            if (taskClass) {
                const statKey = taskClass.statType;
                const progressKey = `${statKey}Progress` as keyof Character;
                const currentProgress = newChar[progressKey] as number;
                const currentStatValue = newChar[statKey] as number;

                let updatedProgress = currentProgress + 1;
                let updatedStatValue = currentStatValue;

                if (updatedProgress >= currentStatValue + 1) {
                    updatedProgress = 0;
                    updatedStatValue++;
                }

                newChar = {
                    ...newChar,
                    [statKey]: updatedStatValue,
                    [progressKey]: updatedProgress,
                };
            }
        }

        if (task.skillId) {
            const skill = skills.find(s => s.id === task.skillId);
            if (skill) {
                let updatedProgress = skill.progress + 1;
                let updatedLevel = skill.level;

                if (updatedProgress >= skill.level + 1) {
                    updatedProgress = 0;
                    updatedLevel++;
                }

                setSkills(skills.map(s => s.id === task.skillId ? { ...s, level: updatedLevel, progress: updatedProgress } : s));
            }
        }

        setCharacter(newChar);
    }

    function addProject() {
        if (!newProjectName.trim()) return;
        const randomColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
        const newProject: Project = {
            id: Date.now().toString(),
            name: newProjectName,
            color: randomColor,
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

    function addTaskClass() {
        if (!newClassName.trim()) return;
        const randomColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
        const newClass: TaskClass = {
            id: Date.now().toString(),
            name: newClassName,
            statType: newClassStat,
            color: randomColor,
        };
        setTaskClasses([...taskClasses, newClass]);
        setNewClassName("");
    }

    function deleteTaskClass(classId: string) {
        setTaskClasses(taskClasses.filter(c => c.id !== classId));
        setTasks(tasks.map(t => (t.classId === classId ? { ...t, classId: null } : t)));
    }

    function addSkill() {
        if (!newSkillName.trim()) return;
        const randomColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
        const newSkill: Skill = {
            id: Date.now().toString(),
            name: newSkillName,
            level: 1,
            progress: 0,
            color: randomColor,
        };
        setSkills([...skills, newSkill]);
        setNewSkillName("");
    }

    function deleteSkill(skillId: string) {
        setSkills(skills.filter(s => s.id !== skillId));
        setTasks(tasks.map(t => (t.skillId === skillId ? { ...t, skillId: null } : t)));
    }

    function resetProgress() {
        setTasks([]);
        setProjects([]);
        setTaskClasses([]);
        setSkills([]);
        setCharacter({
            name: "Adventurer",
            level: 1,
            xp: 0,
            totalXp: 0,
            avatar: "⚔️",
            strength: 1,
            strengthProgress: 0,
            endurance: 1,
            enduranceProgress: 0,
            intelligence: 1,
            intelligenceProgress: 0,
            agility: 1,
            agilityProgress: 0,
            charisma: 1,
            charismaProgress: 0,
            unspentPoints: 0,
        });
        setRecurringCompletions([]);
        setShowResetConfirm(false);
    }

    function getTasksForDate(date: string) {
        return tasks.filter(t => {
            if (t.isRecurring) {
                if (t.recurringType === "daily") return true;
                if (t.recurringType === "weekly") {
                    const taskDay = new Date(t.dueDate).getDay();
                    const targetDay = new Date(date).getDay();
                    return taskDay === targetDay;
                }
                if (t.recurringType === "monthly") {
                    const taskDate = new Date(t.dueDate).getDate();
                    const targetDate = new Date(date).getDate();
                    return taskDate === targetDate;
                }
            }
            return t.dueDate === date;
        });
    }

    function isTaskCompletedOnDate(task: Task, date: string): boolean {
        if (task.isRecurring) {
            const completion = recurringCompletions.find(rc => rc.taskId === task.id && rc.date === date);
            return completion?.completed || false;
        }
        return task.completed;
    }

    const weekDates = getWeekDates(selectedDate);
    const monthDates = getMonthDates(selectedMonth);

    const dailyTasks = getTasksForDate(selectedDate);

    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const xpForNextLevel = calculateXpForLevel(character.level);

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
                                    const isCompleted = isTaskCompletedOnDate(task, selectedDate);
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
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                            {weekDates.map(date => {
                                const dayTasks = getTasksForDate(date);
                                const completedCount = dayTasks.filter(t => isTaskCompletedOnDate(t, date)).length;
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
                                                const isCompleted = isTaskCompletedOnDate(task, date);
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
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                            />
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

                                const dayTasks = getTasksForDate(date);
                                const completedCount = dayTasks.filter(t => isTaskCompletedOnDate(t, date)).length;
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
                                                const isCompleted = isTaskCompletedOnDate(task, date);
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
                                <p className="text-sm text-slate-400 mt-1">Today's tasks, flexible tasks, and tomorrow's planning</p>
                            </div>
                        </div>

                        {/* Dzisiejsze zadania */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-indigo-400">📅 Today ({formatShortDate(today)})</h3>
                            <div className="space-y-3">
                                {tasks.filter(t => !t.completed && t.dueDate === today).length === 0 ? (
                                    <p className="text-slate-400 text-sm">No tasks for today</p>
                                ) : (
                                    tasks.filter(t => !t.completed && t.dueDate === today).map(task => {
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

                        {/* Jutrzejsze zadania */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-purple-400">🌅 Tomorrow ({formatShortDate(tomorrow)})</h3>
                            <div className="space-y-3">
                                {tasks.filter(t => !t.completed && t.dueDate === tomorrow).length === 0 ? (
                                    <p className="text-slate-400 text-sm">No tasks scheduled for tomorrow</p>
                                ) : (
                                    tasks.filter(t => !t.completed && t.dueDate === tomorrow).map(task => {
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
                                                    <span className="text-xs sm:text-sm">
                                                        {stat.icon} {stat.name}
                                                    </span>
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
                        <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700 my-8">
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
