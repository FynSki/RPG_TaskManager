import { useEffect, useState } from "react";

/**
 * Professional-styled Task Quest app (updated)
 * - Full app: daily/weekly/monthly/all/projects/settings
 * - Stats: strength / dexterity / intelligence with n+1 progression
 * - Task class mapping to stats
 * - NEW: Skills system (user-created skills, assignable to tasks, progress/levels)
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
    dueDate: string;
    subtasks: SubTask[];
    createdAt: string;
    isRecurring?: boolean;
    recurringType?: "daily" | "weekly" | "monthly";
    recurringDay?: number;
    statType?: "strength" | "endurance" | "intelligence" | "agility" | "charisma" | null;
    classId?: string | null;
    skillId?: string | null;
};

type Character = {
    name: string;
    level: number;
    xp: number;
    totalXp: number;
    avatar: string;
    strength: number;
    endurance: number;
    intelligence: number;
    agility: number;
    charisma: number;
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
function formatDateDayMonth(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${day}.${month}`;
}

// NOWA FUNKCJA: Sprawdzanie czy data jest dzisiaj
function isToday(dateStr: string): boolean {
    const today = new Date().toISOString().slice(0, 10);
    return dateStr === today;
}

type ProgressBarProps = {
    value: number;
    max: number;
};

function ProgressBar({ value, max }: ProgressBarProps) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div className="relative w-full bg-slate-700 rounded-full h-3 overflow-hidden border border-slate-600">
            <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
            />
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
        strength: 1,
        endurance: 1,
        intelligence: 1,
        agility: 1,
        charisma: 1,
        unspentPoints: 0,
    });

    const [tasks, setTasks] = usePersistedState<Task[]>("tasks", []);
    const [projects, setProjects] = usePersistedState<Project[]>("projects", []);
    const [completions, setCompletions] = usePersistedState<RecurringTaskCompletion[]>("completions", []);
    const [taskClasses, setTaskClasses] = usePersistedState<TaskClass[]>("taskClasses", []);
    const [skills, setSkills] = usePersistedState<Skill[]>("skills", []);

    const [view, setView] = useState<"daily" | "weekly" | "monthly" | "all" | "projects" | "settings">("settings");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const [taskName, setTaskName] = useState("");
    const [taskDesc, setTaskDesc] = useState("");
    const [taskProject, setTaskProject] = useState<string | null>(null);
    const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
    const [taskXp, setTaskXp] = useState(50);
    const [taskDueDate, setTaskDueDate] = useState(selectedDate);
    const [taskRecurring, setTaskRecurring] = useState(false);
    const [taskRecurringType, setTaskRecurringType] = useState<"daily" | "weekly" | "monthly">("daily");
    const [taskRecurringDay, setTaskRecurringDay] = useState(1);
    const [taskClass, setTaskClass] = useState<string | null>(null);
    const [taskSkill, setTaskSkill] = useState<string | null>(null);

    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");

    const [newClassName, setNewClassName] = useState("");
    const [newClassStat, setNewClassStat] = useState<"strength" | "endurance" | "intelligence" | "agility" | "charisma">("strength");

    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const [newSkillName, setNewSkillName] = useState("");

    useEffect(() => {
        if (character.xp >= calculateXpForLevel(character.level)) {
            const newLevel = character.level + 1;
            setCharacter({
                ...character,
                level: newLevel,
                xp: 0,
                unspentPoints: character.unspentPoints + 1,
            });
        }
    }, [character, setCharacter]);

    function getTasksForDate(date: string): Task[] {
        const dateObj = new Date(date);
        const dayOfMonth = dateObj.getDate();
        const dayOfWeek = dateObj.getDay();

        return tasks.filter((task) => {
            if (task.completed && !task.isRecurring) {
                return false;
            }

            if (task.isRecurring) {
                const completedToday = completions.some(
                    (c) => c.taskId === task.id && c.date === date && c.completed
                );
                if (completedToday) return false;

                if (task.recurringType === "daily") return true;
                if (task.recurringType === "weekly" && dayOfWeek === (task.recurringDay ?? 1)) {
                    return true;
                }
                if (task.recurringType === "monthly" && dayOfMonth === (task.recurringDay ?? 1)) {
                    return true;
                }
                return false;
            }

            return task.dueDate === date;
        });
    }

    function completeTask(task: Task, date: string) {
        if (task.isRecurring) {
            const alreadyCompleted = completions.some(
                (c) => c.taskId === task.id && c.date === date && c.completed
            );
            if (alreadyCompleted) return;
            setCompletions([...completions, { taskId: task.id, date, completed: true }]);
        } else {
            setTasks(tasks.map((t) => (t.id === task.id ? { ...t, completed: true } : t)));
        }

        const newXp = character.xp + task.xpReward;
        const newTotalXp = character.totalXp + task.xpReward;
        setCharacter({ ...character, xp: newXp, totalXp: newTotalXp });

        if (task.statType) {
            const stat = task.statType;
            setCharacter((ch) => ({ ...ch, [stat]: ch[stat] + 1 }));
        }

        if (task.classId) {
            const classObj = taskClasses.find((c) => c.id === task.classId);
            if (classObj) {
                const stat = classObj.statType;
                setCharacter((ch) => ({ ...ch, [stat]: ch[stat] + 1 }));
            }
        }

        if (task.skillId) {
            const skill = skills.find((s) => s.id === task.skillId);
            if (skill) {
                const newProgress = skill.progress + 1;
                if (newProgress >= skill.level + 1) {
                    setSkills(
                        skills.map((s) =>
                            s.id === skill.id ? { ...s, level: s.level + 1, progress: 0 } : s
                        )
                    );
                } else {
                    setSkills(
                        skills.map((s) => (s.id === skill.id ? { ...s, progress: newProgress } : s))
                    );
                }
            }
        }
    }

    function uncompleteTask(task: Task, date: string) {
        if (task.isRecurring) {
            setCompletions(completions.filter((c) => !(c.taskId === task.id && c.date === date)));
        } else {
            setTasks(tasks.map((t) => (t.id === task.id ? { ...t, completed: false } : t)));
        }

        const newXp = character.xp - task.xpReward;
        const newTotalXp = character.totalXp - task.xpReward;
        setCharacter({ ...character, xp: newXp, totalXp: newTotalXp });

        if (task.statType) {
            const stat = task.statType;
            setCharacter((ch) => ({ ...ch, [stat]: Math.max(1, ch[stat] - 1) }));
        }

        if (task.classId) {
            const classObj = taskClasses.find((c) => c.id === task.classId);
            if (classObj) {
                const stat = classObj.statType;
                setCharacter((ch) => ({ ...ch, [stat]: Math.max(1, ch[stat] - 1) }));
            }
        }

        if (task.skillId) {
            const skill = skills.find((s) => s.id === task.skillId);
            if (skill) {
                const newProgress = Math.max(0, skill.progress - 1);
                setSkills(skills.map((s) => (s.id === skill.id ? { ...s, progress: newProgress } : s)));
            }
        }
    }

    function isTaskCompleted(task: Task, date: string): boolean {
        if (task.isRecurring) {
            return completions.some((c) => c.taskId === task.id && c.date === date && c.completed);
        }
        return task.completed;
    }

    function openTaskModal(date: string | null = null) {
        const targetDate = date || selectedDate;
        setTaskDueDate(targetDate);
        setShowTaskModal(true);
    }

    function closeTaskModal() {
        setShowTaskModal(false);
        setEditingTask(null);
        setTaskName("");
        setTaskDesc("");
        setTaskProject(null);
        setTaskPriority("medium");
        setTaskXp(50);
        setTaskDueDate(selectedDate);
        setTaskRecurring(false);
        setTaskRecurringType("daily");
        setTaskRecurringDay(1);
        setTaskClass(null);
        setTaskSkill(null);
    }

    function saveTask() {
        if (!taskName.trim()) return;

        let chosenClass = taskClass;
        let chosenStat: "strength" | "dexterity" | "intelligence" | null = null;

        if (chosenClass) {
            const c = taskClasses.find((tc) => tc.id === chosenClass);
            if (c) chosenStat = c.statType;
        }

        if (editingTask) {
            setTasks(
                tasks.map((t) =>
                    t.id === editingTask.id
                        ? {
                            ...t,
                            name: taskName,
                            description: taskDesc,
                            projectId: taskProject,
                            priority: taskPriority,
                            xpReward: taskXp,
                            dueDate: taskDueDate,
                            isRecurring: taskRecurring,
                            recurringType: taskRecurring ? taskRecurringType : undefined,
                            recurringDay: taskRecurring ? taskRecurringDay : undefined,
                            classId: chosenClass,
                            statType: chosenStat,
                            skillId: taskSkill,
                        }
                        : t
                )
            );
        } else {
            const newTask: Task = {
                id: Date.now().toString(),
                projectId: taskProject,
                name: taskName,
                description: taskDesc,
                completed: false,
                xpReward: taskXp,
                priority: taskPriority,
                dueDate: taskDueDate,
                subtasks: [],
                createdAt: new Date().toISOString(),
                isRecurring: taskRecurring,
                recurringType: taskRecurring ? taskRecurringType : undefined,
                recurringDay: taskRecurring ? taskRecurringDay : undefined,
                classId: chosenClass,
                statType: chosenStat,
                skillId: taskSkill,
            };
            setTasks([...tasks, newTask]);
        }
        closeTaskModal();
    }

    function deleteTask(id: string) {
        setTasks(tasks.filter((t) => t.id !== id));
    }

    function editTask(task: Task) {
        setEditingTask(task);
        setTaskName(task.name);
        setTaskDesc(task.description);
        setTaskProject(task.projectId);
        setTaskPriority(task.priority);
        setTaskXp(task.xpReward);
        setTaskDueDate(task.dueDate);
        setTaskRecurring(task.isRecurring || false);
        setTaskRecurringType(task.recurringType || "daily");
        setTaskRecurringDay(task.recurringDay || 1);
        setTaskClass(task.classId || null);
        setTaskSkill(task.skillId || null);
        setShowTaskModal(true);
    }

    function addProject() {
        if (!newProjectName.trim()) return;
        const colors = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const newProject: Project = {
            id: Date.now().toString(),
            name: newProjectName,
            color,
            description: newProjectDesc,
        };
        setProjects([...projects, newProject]);
        setNewProjectName("");
        setNewProjectDesc("");
    }

    function deleteProject(id: string) {
        setProjects(projects.filter((p) => p.id !== id));
        setTasks(tasks.map((t) => (t.projectId === id ? { ...t, projectId: null } : t)));
    }

    function addTaskClass() {
        if (!newClassName.trim()) return;
        const colors = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const newClass: TaskClass = {
            id: Date.now().toString(),
            name: newClassName,
            statType: newClassStat,
            color,
        };
        setTaskClasses([...taskClasses, newClass]);
        setNewClassName("");
    }

    function deleteTaskClass(id: string) {
        setTaskClasses(taskClasses.filter((c) => c.id !== id));
        setTasks(tasks.map((t) => (t.classId === id ? { ...t, classId: null, statType: null } : t)));
    }

    function addSkill() {
        if (!newSkillName.trim()) return;
        const colors = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const newSkill: Skill = {
            id: Date.now().toString(),
            name: newSkillName,
            level: 1,
            progress: 0,
            color,
        };
        setSkills([...skills, newSkill]);
        setNewSkillName("");
    }

    function deleteSkill(id: string) {
        setSkills(skills.filter((s) => s.id !== id));
        setTasks(tasks.map((t) => (t.skillId === id ? { ...t, skillId: null } : t)));
    }

    function increaseStrength() {
        if (character.unspentPoints > 0) {
            setCharacter({ ...character, strength: character.strength + 1, unspentPoints: character.unspentPoints - 1 });
        }
    }

    function increaseEndurance() {
        if (character.unspentPoints > 0) {
            setCharacter({ ...character, endurance: character.endurance + 1, unspentPoints: character.unspentPoints - 1 });
        }
    }

    function increaseIntelligence() {
        if (character.unspentPoints > 0) {
            setCharacter({ ...character, intelligence: character.intelligence + 1, unspentPoints: character.unspentPoints - 1 });
        }
    }

    function increaseAgility() {
        if (character.unspentPoints > 0) {
            setCharacter({ ...character, agility: character.agility + 1, unspentPoints: character.unspentPoints - 1 });
        }
    }

    function increaseCharisma() {
        if (character.unspentPoints > 0) {
            setCharacter({ ...character, charisma: character.charisma + 1, unspentPoints: character.unspentPoints - 1 });
        }
    }

    function resetProgress() {
        setCharacter({
            name: "Hero",
            level: 1,
            xp: 0,
            totalXp: 0,
            avatar: AVATARS[0],
            strength: 1,
            endurance: 1,
            intelligence: 1,
            agility: 1,
            charisma: 1,
            unspentPoints: 0,
        });
        setTasks([]);
        setProjects([]);
        setCompletions([]);
        setTaskClasses([]);
        setSkills([]);
        setShowResetConfirm(false);
    }

    function previousDay() {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 1);
        setSelectedDate(d.toISOString().slice(0, 10));
    }

    function nextDay() {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 1);
        setSelectedDate(d.toISOString().slice(0, 10));
    }

    function previousWeek() {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 7);
        setSelectedDate(d.toISOString().slice(0, 10));
    }

    function nextWeek() {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 7);
        setSelectedDate(d.toISOString().slice(0, 10));
    }

    function previousMonth() {
        const d = new Date(selectedDate);
        const m = d.getMonth();
        d.setMonth(m - 1); // POPRAWIONE: było m - 2
        setSelectedDate(d.toISOString().slice(0, 10));
    }

    function nextMonth() {
        const d = new Date(selectedDate);
        const m = d.getMonth();
        d.setMonth(m + 1); // POPRAWIONE: było m - 2
        setSelectedDate(d.toISOString().slice(0, 10));
    }

    const weekDates = getWeekDates(selectedDate);
    const monthDates = getMonthDates(selectedDate);

    const allTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);

    const xpForNextLevel = calculateXpForLevel(character.level);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <div className="max-w-full mx-auto p-2 sm:p-4 lg:p-6">
                <header className="mb-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 border border-slate-700">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">{character.avatar}</div>
                            <div>
                                <h1 className="text-3xl font-bold text-indigo-400">{character.name}</h1>
                                <p className="text-slate-300">Level {character.level} Adventurer</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-300">XP</span>
                                <div className="w-48">
                                    <ProgressBar value={character.xp} max={xpForNextLevel} />
                                </div>
                                <span className="text-xs text-slate-400">
                                    {character.xp}/{xpForNextLevel}
                                </span>
                            </div>

                            <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-rose-400">💪</span>
                                    <span className="text-slate-300">STR: {character.strength}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-orange-400">❤️</span>
                                    <span className="text-slate-300">END: {character.endurance}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-400">🧠</span>
                                    <span className="text-slate-300">INT: {character.intelligence}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-400">⚡</span>
                                    <span className="text-slate-300">AGI: {character.agility}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-purple-400">✨</span>
                                    <span className="text-slate-300">CHA: {character.charisma}</span>
                                </div>
                                {character.unspentPoints > 0 && (
                                    <span className="text-yellow-400 font-semibold">
                                        ⭐ {character.unspentPoints} points
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <nav className="mb-6 flex flex-wrap gap-2 justify-center">
                    {(["settings", "daily", "weekly", "monthly", "projects", "all"] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-6 py-3 rounded-lg font-medium transition ${view === v
                                    ? "bg-indigo-600 text-white shadow-lg"
                                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                                }`}
                        >
                            {v === "settings" ? "Character" : v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                    ))}
                </nav>

                {view === "daily" && (
                    <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={previousDay}
                                className="bg-slate-900 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-700 border border-slate-700"
                            >
                                ◀ Previous
                            </button>
                            <h2 className="text-2xl font-semibold">{selectedDate}</h2>
                            <button
                                onClick={nextDay}
                                className="bg-slate-900 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-700 border border-slate-700"
                            >
                                Next ▶
                            </button>
                        </div>

                        <button
                            onClick={() => openTaskModal()}
                            className="mb-6 w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                        >
                            + Add Quest
                        </button>

                        <div className="space-y-3">
                            {getTasksForDate(selectedDate).map((task) => {
                                const isCompleted = isTaskCompleted(task, selectedDate);
                                const project = projects.find((p) => p.id === task.projectId);
                                const taskClassObj = taskClasses.find((c) => c.id === task.classId);
                                const taskSkillObj = skills.find((s) => s.id === task.skillId);
                                return (
                                    <div
                                        key={task.id}
                                        className={`p-4 rounded-lg border transition ${isCompleted
                                                ? "bg-slate-900 border-slate-700 opacity-60"
                                                : "bg-slate-900 border-slate-700 hover:border-indigo-500"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={isCompleted}
                                                onChange={() =>
                                                    isCompleted
                                                        ? uncompleteTask(task, selectedDate)
                                                        : completeTask(task, selectedDate)
                                                }
                                                className="mt-1 w-5 h-5 cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3
                                                        className={`font-semibold ${isCompleted ? "line-through text-slate-500" : ""
                                                            }`}
                                                    >
                                                        {task.name}
                                                    </h3>
                                                    {project && (
                                                        <span
                                                            className="text-xs px-2 py-1 rounded"
                                                            style={{ backgroundColor: project.color + "33", color: project.color }}
                                                        >
                                                            {project.name}
                                                        </span>
                                                    )}
                                                    {taskClassObj && (
                                                        <span
                                                            className="text-xs px-2 py-1 rounded"
                                                            style={{
                                                                backgroundColor: taskClassObj.color + "33",
                                                                color: taskClassObj.color,
                                                            }}
                                                        >
                                                            {taskClassObj.name}
                                                        </span>
                                                    )}
                                                    {taskSkillObj && (
                                                        <span
                                                            className="text-xs px-2 py-1 rounded"
                                                            style={{
                                                                backgroundColor: taskSkillObj.color + "33",
                                                                color: taskSkillObj.color,
                                                            }}
                                                        >
                                                            {taskSkillObj.name}
                                                        </span>
                                                    )}
                                                </div>
                                                {task.description && (
                                                    <p className="text-sm text-slate-400 mb-2">{task.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                                    <span>+{task.xpReward} XP</span>
                                                    <span
                                                        className={`px-2 py-1 rounded ${task.priority === "high"
                                                                ? "bg-rose-900 text-rose-300"
                                                                : task.priority === "medium"
                                                                    ? "bg-yellow-900 text-yellow-300"
                                                                    : "bg-slate-700 text-slate-300"
                                                            }`}
                                                    >
                                                        {task.priority}
                                                    </span>
                                                    {task.isRecurring && (
                                                        <span className="px-2 py-1 rounded bg-indigo-900 text-indigo-300">
                                                            🔄 {task.recurringType}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => editTask(task)}
                                                    className="text-indigo-400 hover:text-indigo-300 text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteTask(task.id)}
                                                    className="text-rose-500 hover:text-rose-400 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {getTasksForDate(selectedDate).length === 0 && (
                                <p className="text-center text-slate-400 py-8">
                                    No quests today. Add one to start your adventure!
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {view === "weekly" && (
                    <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={previousWeek}
                                className="bg-slate-900 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-700 border border-slate-700 text-sm"
                            >
                                ◀ Previous
                            </button>
                            <h2 className="text-xl sm:text-2xl font-semibold">Weekly View</h2>
                            <button
                                onClick={nextWeek}
                                className="bg-slate-900 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-700 border border-slate-700 text-sm"
                            >
                                Next ▶
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                            {weekDates.map((date) => {
                                const isTodayDate = isToday(date);
                                return (
                                    <div
                                        key={date}
                                        className={`rounded-lg p-3 border transition-all ${isTodayDate
                                                ? 'bg-indigo-900 border-indigo-500 shadow-lg shadow-indigo-500/20'
                                                : 'bg-slate-900 border-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className={`font-semibold ${isTodayDate ? 'text-indigo-300' : 'text-indigo-400'}`}>
                                                    {getDayName(date)}
                                                </h3>
                                                <p className="text-xs text-slate-400">{formatDateDayMonth(date)}</p>
                                            </div>
                                            <button
                                                onClick={() => openTaskModal(date)}
                                                className={`hover:scale-110 transition-transform text-lg leading-none w-6 h-6 flex items-center justify-center rounded ${isTodayDate
                                                        ? 'text-indigo-300 hover:text-indigo-200'
                                                        : 'text-indigo-400 hover:text-indigo-300'
                                                    }`}
                                                title="Add task"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {getTasksForDate(date).map((task) => {
                                                const isCompleted = isTaskCompleted(task, date);
                                                const project = projects.find((p) => p.id === task.projectId);
                                                return (
                                                    <div
                                                        key={task.id}
                                                        className={`p-2 rounded text-xs border ${isCompleted
                                                                ? "bg-slate-800 border-slate-700 opacity-60"
                                                                : "bg-slate-800 border-slate-700 hover:border-indigo-500"
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={isCompleted}
                                                                onChange={() =>
                                                                    isCompleted
                                                                        ? uncompleteTask(task, date)
                                                                        : completeTask(task, date)
                                                                }
                                                                className="mt-0.5 w-3 h-3 cursor-pointer"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <div
                                                                    className={`font-medium truncate ${isCompleted ? "line-through text-slate-500" : ""
                                                                        }`}
                                                                >
                                                                    {task.name}
                                                                </div>
                                                                {project && (
                                                                    <div
                                                                        className="text-xs mt-1 truncate"
                                                                        style={{ color: project.color }}
                                                                    >
                                                                        {project.name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
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
                    <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={previousMonth}
                                className="bg-slate-900 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-700 border border-slate-700 text-sm"
                            >
                                ◀ Previous
                            </button>
                            <h2 className="text-lg sm:text-2xl font-semibold">
                                {new Date(selectedDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                })}
                            </h2>
                            <button
                                onClick={nextMonth}
                                className="bg-slate-900 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-700 border border-slate-700 text-sm"
                            >
                                Next ▶
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 sm:gap-2">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                <div key={day} className="text-center text-slate-400 text-xs sm:text-sm font-semibold py-2">
                                    {day}
                                </div>
                            ))}

                            {monthDates.map((date, idx) => {
                                if (!date) {
                                    return <div key={idx} className="bg-slate-900 rounded-lg p-2 border border-slate-700" />;
                                }
                                const dayTasks = getTasksForDate(date);
                                const dayNum = new Date(date).getDate();
                                const isTodayDate = isToday(date);
                                return (
                                    <div
                                        key={date}
                                        className={`rounded-lg p-2 border min-h-20 transition-all ${isTodayDate
                                                ? 'bg-indigo-900 border-indigo-500 shadow-lg shadow-indigo-500/20'
                                                : 'bg-slate-900 border-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className={`text-xs sm:text-sm font-semibold ${isTodayDate ? 'text-indigo-300' : 'text-slate-300'
                                                }`}>
                                                {dayNum}
                                            </div>
                                            <button
                                                onClick={() => openTaskModal(date)}
                                                className={`hover:scale-110 transition-transform text-sm leading-none w-5 h-5 flex items-center justify-center rounded ${isTodayDate
                                                        ? 'text-indigo-300 hover:text-indigo-200'
                                                        : 'text-indigo-400 hover:text-indigo-300'
                                                    }`}
                                                title="Add task"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="space-y-1">
                                            {dayTasks.slice(0, 3).map((task) => {
                                                const isCompleted = isTaskCompleted(task, date);
                                                return (
                                                    <div
                                                        key={task.id}
                                                        className={`text-xs px-1 py-1 rounded truncate ${isCompleted
                                                                ? "bg-slate-800 text-slate-500 line-through"
                                                                : "bg-indigo-900 text-indigo-300"
                                                            }`}
                                                    >
                                                        {task.name}
                                                    </div>
                                                );
                                            })}
                                            {dayTasks.length > 3 && (
                                                <div className="text-xs text-slate-400">+{dayTasks.length - 3} more</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {view === "all" && (
                    <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700 max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold">All Quests</h2>
                            <button
                                onClick={() => openTaskModal()}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                            >
                                + Add Quest
                            </button>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4 text-indigo-400">Active Quests</h3>
                            <div className="space-y-3">
                                {allTasks.map((task) => {
                                    const project = projects.find((p) => p.id === task.projectId);
                                    const taskClassObj = taskClasses.find((c) => c.id === task.classId);
                                    const taskSkillObj = skills.find((s) => s.id === task.skillId);
                                    return (
                                        <div
                                            key={task.id}
                                            className="p-4 rounded-lg border bg-slate-900 border-slate-700 hover:border-indigo-500 transition"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold">{task.name}</h3>
                                                        {project && (
                                                            <span
                                                                className="text-xs px-2 py-1 rounded"
                                                                style={{
                                                                    backgroundColor: project.color + "33",
                                                                    color: project.color,
                                                                }}
                                                            >
                                                                {project.name}
                                                            </span>
                                                        )}
                                                        {taskClassObj && (
                                                            <span
                                                                className="text-xs px-2 py-1 rounded"
                                                                style={{
                                                                    backgroundColor: taskClassObj.color + "33",
                                                                    color: taskClassObj.color,
                                                                }}
                                                            >
                                                                {taskClassObj.name}
                                                            </span>
                                                        )}
                                                        {taskSkillObj && (
                                                            <span
                                                                className="text-xs px-2 py-1 rounded"
                                                                style={{
                                                                    backgroundColor: taskSkillObj.color + "33",
                                                                    color: taskSkillObj.color,
                                                                }}
                                                            >
                                                                {taskSkillObj.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {task.description && (
                                                        <p className="text-sm text-slate-400 mb-2">{task.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                                        <span>Due: {task.dueDate}</span>
                                                        <span>+{task.xpReward} XP</span>
                                                        <span
                                                            className={`px-2 py-1 rounded ${task.priority === "high"
                                                                    ? "bg-rose-900 text-rose-300"
                                                                    : task.priority === "medium"
                                                                        ? "bg-yellow-900 text-yellow-300"
                                                                        : "bg-slate-700 text-slate-300"
                                                                }`}
                                                        >
                                                            {task.priority}
                                                        </span>
                                                        {task.isRecurring && (
                                                            <span className="px-2 py-1 rounded bg-indigo-900 text-indigo-300">
                                                                🔄 {task.recurringType}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => editTask(task)}
                                                        className="text-indigo-400 hover:text-indigo-300 text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteTask(task.id)}
                                                        className="text-rose-500 hover:text-rose-400 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {allTasks.length === 0 && (
                                    <p className="text-center text-slate-400 py-8">
                                        No active quests. Create one to begin your journey!
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-slate-400">Completed Quests</h3>
                            <div className="space-y-2">
                                {completedTasks.map((task) => {
                                    const project = projects.find((p) => p.id === task.projectId);
                                    return (
                                        <div
                                            key={task.id}
                                            className="p-3 rounded-lg bg-slate-900 border border-slate-700 opacity-60"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-indigo-400">✓</span>
                                                <span className="line-through text-slate-500">{task.name}</span>
                                                {project && (
                                                    <span className="text-xs text-slate-500">{project.name}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {completedTasks.length === 0 && (
                                    <p className="text-center text-slate-400 py-4">No completed quests yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showTaskModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-2xl font-semibold mb-4">
                                {editingTask ? "Edit Quest" : "Create New Quest"}
                            </h3>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Quest name"
                                    value={taskName}
                                    onChange={(e) => setTaskName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                />

                                <textarea
                                    placeholder="Description (optional)"
                                    value={taskDesc}
                                    onChange={(e) => setTaskDesc(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 resize-none"
                                    rows={3}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-300 mb-1">Project</label>
                                        <select
                                            value={taskProject || ""}
                                            onChange={(e) => setTaskProject(e.target.value || null)}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                        >
                                            <option value="">No Project</option>
                                            {projects.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-300 mb-1">Priority</label>
                                        <select
                                            value={taskPriority}
                                            onChange={(e) =>
                                                setTaskPriority(e.target.value as "low" | "medium" | "high")
                                            }
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-300 mb-1">XP Reward</label>
                                        <input
                                            type="number"
                                            value={taskXp}
                                            onChange={(e) => setTaskXp(Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-300 mb-1">Due Date</label>
                                        <input
                                            type="date"
                                            value={taskDueDate}
                                            onChange={(e) => setTaskDueDate(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">Task Class</label>
                                    <select
                                        value={taskClass || ""}
                                        onChange={(e) => setTaskClass(e.target.value || null)}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                    >
                                        <option value="">No Class</option>
                                        {taskClasses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.statType})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">Skill</label>
                                    <select
                                        value={taskSkill || ""}
                                        onChange={(e) => setTaskSkill(e.target.value || null)}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                    >
                                        <option value="">No Skill</option>
                                        {skills.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} (Lvl {s.level})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="recurring"
                                        checked={taskRecurring}
                                        onChange={(e) => setTaskRecurring(e.target.checked)}
                                        className="w-5 h-5 cursor-pointer"
                                    />
                                    <label htmlFor="recurring" className="text-slate-300">
                                        Recurring Quest
                                    </label>
                                </div>

                                {taskRecurring && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-slate-300 mb-1">Frequency</label>
                                            <select
                                                value={taskRecurringType}
                                                onChange={(e) =>
                                                    setTaskRecurringType(
                                                        e.target.value as "daily" | "weekly" | "monthly"
                                                    )
                                                }
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                        </div>

                                        {taskRecurringType !== "daily" && (
                                            <div>
                                                <label className="block text-sm text-slate-300 mb-1">
                                                    {taskRecurringType === "weekly" ? "Day of Week" : "Day of Month"}
                                                </label>
                                                <input
                                                    type="number"
                                                    min={taskRecurringType === "weekly" ? 0 : 1}
                                                    max={taskRecurringType === "weekly" ? 6 : 31}
                                                    value={taskRecurringDay}
                                                    onChange={(e) => setTaskRecurringDay(Number(e.target.value))}
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
                                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                                >
                                    {editingTask ? "Save Changes" : "Create Quest"}
                                </button>
                                <button
                                    onClick={closeTaskModal}
                                    className="flex-1 bg-slate-900 text-slate-300 px-6 py-3 rounded-lg hover:bg-slate-700 border border-slate-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {view === "settings" && (
                    <div className="space-y-6 max-w-7xl mx-auto">
                        <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700">
                            <h2 className="text-2xl font-semibold mb-6">Character Settings</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-300 mb-2">Character Name</label>
                                    <input
                                        type="text"
                                        value={character.name}
                                        onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-300 mb-2">Avatar</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {AVATARS.map((avatar) => (
                                            <button
                                                key={avatar}
                                                onClick={() => setCharacter({ ...character, avatar })}
                                                className={`text-4xl p-3 rounded-lg transition ${character.avatar === avatar
                                                        ? "bg-indigo-600"
                                                        : "bg-slate-900 hover:bg-slate-700 border border-slate-700"
                                                    }`}
                                            >
                                                {avatar}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700">
                            <h2 className="text-2xl font-semibold mb-6">Stats</h2>

                            {character.unspentPoints > 0 && (
                                <div className="mb-4 p-4 bg-indigo-900 rounded-lg border border-indigo-700">
                                    <p className="text-indigo-100">
                                        You have <strong>{character.unspentPoints}</strong> unspent stat points!
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">💪</span>
                                            <div>
                                                <div className="font-semibold text-rose-400">Strength</div>
                                                <div className="text-2xl text-slate-100">{character.strength}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={increaseStrength}
                                            disabled={character.unspentPoints === 0}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Level Up
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Progress to next level</p>
                                        <ProgressBar value={character.strength - 1} max={character.strength} />
                                        <p className="text-xs text-slate-400 mt-1">
                                            {character.strength - 1}/{character.strength} points to level {character.strength + 1}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">❤️</span>
                                            <div>
                                                <div className="font-semibold text-orange-400">Endurance</div>
                                                <div className="text-2xl text-slate-100">{character.endurance}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={increaseEndurance}
                                            disabled={character.unspentPoints === 0}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Level Up
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Progress to next level</p>
                                        <ProgressBar value={character.endurance - 1} max={character.endurance} />
                                        <p className="text-xs text-slate-400 mt-1">
                                            {character.endurance - 1}/{character.endurance} points to level {character.endurance + 1}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">🧠</span>
                                            <div>
                                                <div className="font-semibold text-blue-400">Intelligence</div>
                                                <div className="text-2xl text-slate-100">{character.intelligence}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={increaseIntelligence}
                                            disabled={character.unspentPoints === 0}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Level Up
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Progress to next level</p>
                                        <ProgressBar value={character.intelligence - 1} max={character.intelligence} />
                                        <p className="text-xs text-slate-400 mt-1">
                                            {character.intelligence - 1}/{character.intelligence} points to level {character.intelligence + 1}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">⚡</span>
                                            <div>
                                                <div className="font-semibold text-emerald-400">Agility</div>
                                                <div className="text-2xl text-slate-100">{character.agility}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={increaseAgility}
                                            disabled={character.unspentPoints === 0}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Level Up
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Progress to next level</p>
                                        <ProgressBar value={character.agility - 1} max={character.agility} />
                                        <p className="text-xs text-slate-400 mt-1">
                                            {character.agility - 1}/{character.agility} points to level {character.agility + 1}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">✨</span>
                                            <div>
                                                <div className="font-semibold text-purple-400">Charisma</div>
                                                <div className="text-2xl text-slate-100">{character.charisma}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={increaseCharisma}
                                            disabled={character.unspentPoints === 0}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Level Up
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Progress to next level</p>
                                        <ProgressBar value={character.charisma - 1} max={character.charisma} />
                                        <p className="text-xs text-slate-400 mt-1">
                                            {character.charisma - 1}/{character.charisma} points to level {character.charisma + 1}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded-xl shadow p-4 sm:p-6 border border-slate-700">
                            <h2 className="text-2xl font-semibold mb-6">Skills</h2>

                            <div className="bg-slate-900 rounded-lg p-4 mb-4 border border-slate-700">
                                <h3 className="text-lg font-semibold mb-3">Create New Skill</h3>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Skill name (e.g. Guitar, Spanish, Cooking)"
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
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-3">
                                    {skills.length > 0 ? (
                                        skills.map((s) => (
                                            <div
                                                key={s.id}
                                                className="bg-slate-900 rounded-lg p-4 border border-slate-700"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                                                            style={{ background: s.color }}
                                                        >
                                                            {s.level}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-100">
                                                                {s.name}
                                                            </div>
                                                            <div className="text-sm text-slate-400">
                                                                Level {s.level}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteSkill(s.id)}
                                                        className="text-rose-500 hover:text-rose-400"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                                <div className="mt-2">
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
                )}


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
            </div>
        </div>
    );
}
