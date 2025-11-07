import { useState, useEffect } from "react";
import { AboutPage } from './components/AboutPage';
import { DataManagement } from './components/DataManagement';
import { MinimalOnboarding } from './components/MinimalOnboarding';

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
} from './refactored-src/types';

// Constants
import {
    AVATARS,
    STAT_DESCRIPTIONS,
    DEFAULT_CHARACTER
} from './refactored-src/constants';

// Utilities
import {
    // Date utils
    getWeekDates,
    getMonthDates,
    getDayName,
    formatShortDate,
    formatFullDateTime,
    getToday,
    getTomorrow,
    addDays,
    addMonths,

    // Task utils
    getTasksForDate,
    isTaskCompletedOnDate,
    sortTasks,
    generateRandomColor,
    toggleRecurringTaskCompletion,

    // XP utils
    calculateXpForLevel,
    awardXP as awardXPUtil,

    // Custom hook
    usePersistedState
} from './refactored-src/utils';

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get XP reward based on task rarity
 */
function getRarityXP(rarity: "common" | "rare" | "epic" | "legendary" | "unique" | "low" | "medium" | "high" | any): number {
    // Auto-migrate old priorities to new rarities
    if (rarity === "low") rarity = "common";
    if (rarity === "medium") rarity = "rare";
    if (rarity === "high") rarity = "epic";

    const xpMap: Record<string, number> = {
        common: 50,
        rare: 100,
        epic: 250,
        legendary: 500,
        unique: 1000
    };
    return xpMap[rarity] || 50; // Fallback to 50 if unknown
}

/**
 * Get color styling for task rarity
 */
function getRarityColor(rarity: "common" | "rare" | "epic" | "legendary" | "unique" | "low" | "medium" | "high" | any) {
    // Auto-migrate old priorities to new rarities
    const normalizedRarity = (() => {
        if (rarity === "low") return "common";
        if (rarity === "medium") return "rare";
        if (rarity === "high") return "epic";
        return rarity;
    })();

    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
        common: {
            bg: "bg-slate-700",
            text: "text-slate-300",
            border: "border-slate-600"
        },
        rare: {
            bg: "bg-blue-900",
            text: "text-blue-300",
            border: "border-blue-700"
        },
        epic: {
            bg: "bg-purple-900",
            text: "text-purple-300",
            border: "border-purple-700"
        },
        legendary: {
            bg: "bg-orange-900",
            text: "text-orange-300",
            border: "border-orange-700"
        },
        unique: {
            bg: "bg-yellow-900",
            text: "text-yellow-300",
            border: "border-yellow-700"
        }
    };

    return colorMap[normalizedRarity] || colorMap.common; // Fallback to common if unknown
}

/**
 * Get rarity display name
 */
function getRarityDisplay(rarity: "common" | "rare" | "epic" | "legendary" | "unique" | "low" | "medium" | "high" | any): string {
    // Auto-migrate old priorities to new rarities
    if (rarity === "low") return "Common";
    if (rarity === "medium") return "Rare";
    if (rarity === "high") return "Epic";

    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

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

function RarityBadge({ rarity, showXP = false }: { rarity: "common" | "rare" | "epic" | "legendary" | "unique", showXP?: boolean }) {
    const colors = getRarityColor(rarity);
    const xp = getRarityXP(rarity);
    const display = getRarityDisplay(rarity);

    return (
        <span className={`text-xs px-2 sm:px-3 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
            {display} {showXP && `(${xp} XP)`}
        </span>
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

    // Auto-migrate old priority values to new rarities (one-time migration)
    useEffect(() => {
        const needsMigration = tasks.some(task => {
            const p = task.priority as any;
            return p === "low" || p === "medium" || p === "high";
        });

        if (needsMigration) {
            console.log("🔄 Migrating old priority values to new rarities...");
            const migratedTasks = tasks.map(task => {
                const oldPriority = task.priority as any;

                if (oldPriority === "low") {
                    return { ...task, priority: "common" as const, xpReward: 50 };
                }
                if (oldPriority === "medium") {
                    return { ...task, priority: "rare" as const, xpReward: 100 };
                }
                if (oldPriority === "high") {
                    return { ...task, priority: "epic" as const, xpReward: 250 };
                }

                // Already migrated or new format
                return task;
            });

            setTasks(migratedTasks);
            console.log("✅ Migration complete!");
        }
    }, []); // Run only once on mount

    // Date selection state
    const [selectedDate, setSelectedDate] = useState(getToday());
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    // Modal state
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showCompletedTaskModal, setShowCompletedTaskModal] = useState(false);
    const [viewingTask, setViewingTask] = useState<Task | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showAboutPage, setShowAboutPage] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showStatInfo, setShowStatInfo] = useState<string | null>(null);

    // Onboarding state - shows on first visit only
    const [showOnboarding, setShowOnboarding] = useState(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        return !hasSeenOnboarding;
    });

    // Collapsible panels state
    const [isSkillPanelOpen, setIsSkillPanelOpen] = useState(false);
    const [isTaskClassPanelOpen, setIsTaskClassPanelOpen] = useState(false);

    // Project details view state
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Premium feature flag - Projects are premium-only
    const [isPremium] = useState(false); // Set to true to enable Projects

    // Task form state
    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskPriority, setTaskPriority] = useState<"common" | "rare" | "epic" | "legendary" | "unique">("common");
    const [taskDueDate, setTaskDueDate] = useState("");
    //const [taskXpReward, setTaskXpReward] = useState(50);
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

    // Sorted task lists for different views
    const sortedDailyTasks = sortTasks(dailyTasks);
    const todayTasks = getTasksForDate(tasks, today); // Get all tasks for today INCLUDING recurring
    const sortedTodayTasks = sortTasks(todayTasks.filter(t => !t.completed)); // Only show active tasks
    const sortedTomorrowTasks = sortTasks(tasks.filter(t => !t.completed && t.dueDate === tomorrow && !t.isRecurring));
    //const sortedFlexibleTasks = sortTasks(tasks.filter(t => !t.completed && t.isFlexible));
    //const sortedRecurringTasks = sortTasks(tasks.filter(t => t.isRecurring && (!t.recurringEndDate || t.recurringEndDate >= today)));
    const sortedBacklogTasks = sortTasks(tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today && !t.isRecurring));
    const sortedNoDueDateTasks = sortTasks(tasks.filter(t => !t.completed && !t.dueDate && !t.isRecurring));

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
        setTaskPriority("common");
        setTaskDueDate(date || selectedDate);
        //setTaskXpReward(50);
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
        //setTaskXpReward(getRarityXP(task.priority)); // Auto-assign XP based on rarity
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
            xpReward: getRarityXP(taskPriority), // Auto-assign XP based on rarity
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

    function handleAwardXP(xp: number, task: Task) {
        const result = awardXPUtil(character, xp, task, taskClasses, skills);
        setCharacter(result.character);
        setSkills(result.skills);
    }

    // ========== CHARACTER STAT FUNCTIONS ==========

    function spendPoint(stat: StatType) {
        if (character.unspentPoints <= 0) return;

        const newChar = { ...character };
        newChar.unspentPoints--;
        newChar[stat] = (newChar[stat] as number) + 1;
        setCharacter(newChar);
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

    // ========== ONBOARDING HANDLER ==========

    function handleOnboardingComplete() {
        localStorage.setItem('hasSeenOnboarding', 'true');
        setShowOnboarding(false);
    }

    // ========== RENDER ==========

    // Show About Page (fullscreen overlay)
    if (showAboutPage) {
        return <AboutPage onClose={() => setShowAboutPage(false)} />;
    }

    // Note: The JSX render logic continues in the next part...
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-2 sm:p-4">
            {/* Welcome screen - shows on first visit only */}
            {showOnboarding && (
                <MinimalOnboarding onComplete={handleOnboardingComplete} />
            )}

            <div className="max-w-7xl mx-auto">
                {/* Top Bar - ukryty gdy Project Details jest aktywny */}
                {!selectedProject && (
                    <div className="bg-slate-800 rounded-xl shadow-xl p-3 sm:p-4 md:p-6 mb-4 border border-slate-700 sticky top-0 z-50 backdrop-blur-md bg-slate-800/90">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                <div className="text-4xl sm:text-5xl flex-shrink-0">{character.avatar}</div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent truncate">
                                        {character.name}
                                    </h1>
                                    <p className="text-slate-400 text-xs sm:text-sm">Level {character.level} Adventurer</p>

                                    {/* Mini stats bar */}
                                    <div className="flex flex-wrap gap-3 mt-2 text-slate-300 text-sm">
                                        <span>💪 {character.strength}</span>
                                        <span>🏃 {character.endurance}</span>
                                        <span>🧠 {character.intelligence}</span>
                                        <span>⚡ {character.agility}</span>
                                        <span>✨ {character.charisma}</span>
                                    </div>
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
                )}

                {/* Navigation - ukryta gdy Project Details jest aktywny */}
                {!selectedProject && (
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
                                ]
                                    .filter(item => item.id !== "projects" || isPremium) // Hide Projects if not premium
                                    .map(item => (
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
                                ]
                                    .filter(item => item.id !== "projects" || isPremium) // Hide Projects if not premium
                                    .map(item => (
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
                )}

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
                            {sortedDailyTasks.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <p className="text-lg mb-2">No quests for this day</p>
                                    <p className="text-sm">Click "Add Quest" to create one!</p>
                                </div>
                            ) : (
                                sortedDailyTasks.map(task => {
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
                                                                {task.priority && <RarityBadge rarity={task.priority} />}
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
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                            <h2 className="text-2xl font-semibold">Monthly Quests</h2>
                            <div className="flex items-center gap-2 sm:gap-3 justify-center">
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
                                    className="px-2 sm:px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm sm:text-base"
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
                            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs sm:text-sm font-semibold text-slate-400 mb-2">
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                                    <div key={day}>{day}</div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 sm:gap-2">
                            {monthDates.map((date, idx) => {
                                if (!date)
                                    return <div key={`empty-${idx}`} className="aspect-square bg-slate-900 rounded-lg" />;

                                const dayTasks = getTasksForDate(tasks, date);
                                const completedCount = dayTasks.filter(t => isTaskCompletedOnDate(t, date, recurringCompletions)).length;
                                const isToday = date === today;

                                return (
                                    <div
                                        key={date}
                                        className={`aspect-square bg-slate-900 rounded-lg p-1 sm:p-2 border flex flex-col ${isToday ? "border-indigo-500 ring-1 sm:ring-2 ring-indigo-500" : "border-slate-700"
                                            }`}
                                    >
                                        <div className={`text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 ${isToday ? "text-indigo-400" : ""}`}>
                                            {date.split("-")[2]}
                                        </div>
                                        <div className="flex-1 space-y-0.5 sm:space-y-1 overflow-y-auto">
                                            {dayTasks.slice(0, 2).map(task => {
                                                const isCompleted = isTaskCompletedOnDate(task, date, recurringCompletions);
                                                return (
                                                    <div
                                                        key={task.id}
                                                        onClick={() => openEditModal(task)}
                                                        className={`text-[0.6rem] sm:text-xs truncate cursor-pointer hover:text-indigo-400 transition ${isCompleted ? "line-through text-slate-500" : "text-slate-300"
                                                            }`}
                                                        title={task.name}
                                                    >
                                                        {task.name}
                                                    </div>
                                                );
                                            })}
                                            {dayTasks.length > 2 && (
                                                <div className="text-[0.6rem] sm:text-xs text-slate-500">+{dayTasks.length - 2}</div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => openTaskModal(date)}
                                            className="w-full mt-1 sm:mt-3 text-[0.6rem] sm:text-xs py-1 sm:py-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700"
                                        >
                                            + Add
                                        </button>

                                        {dayTasks.length > 0 && (
                                            <div className="text-[0.6rem] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">
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
                                                                {task.priority && <RarityBadge rarity={task.priority} />}
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
                                <p className="text-sm text-slate-400 mt-1">Today's tasks (including recurring), overdue backlog, flexible tasks, and tomorrow's planning</p>
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
                                {sortedTodayTasks.length === 0 ? (
                                    <p className="text-slate-400 text-sm">No tasks for today</p>
                                ) : (
                                    sortedTodayTasks.map(task => {
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
                                                            {task.priority && <RarityBadge rarity={task.priority} />}
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
                                {sortedTomorrowTasks.length === 0 ? (
                                    <p className="text-slate-400 text-sm">No tasks scheduled for tomorrow</p>
                                ) : (
                                    sortedTomorrowTasks.map(task => {
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
                                                            {task.priority && <RarityBadge rarity={task.priority} />}
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

                        {/* Zadania bez terminu wykonania */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-slate-400">📋 No Due Date (Flexible Tasks)</h3>
                            <div className="space-y-3">
                                {sortedNoDueDateTasks.length === 0 ? (
                                    <p className="text-slate-400 text-sm">No tasks without due date</p>
                                ) : (
                                    sortedNoDueDateTasks.map(task => {
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
                                                            <span className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                                                                📋 No deadline
                                                            </span>
                                                            <span className="text-xs px-3 py-1 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">
                                                                {task.xpReward} XP
                                                            </span>
                                                            {task.priority && <RarityBadge rarity={task.priority} />}
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

                        {/* Backlog - przeterminowane zadania */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-rose-400">⏰ Backlog (Overdue Tasks)</h3>
                            <div className="space-y-3">
                                {sortedBacklogTasks.length === 0 ? (
                                    <p className="text-slate-400 text-sm">No overdue tasks</p>
                                ) : (
                                    sortedBacklogTasks.map(task => {
                                        const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
                                        const taskClass = task.classId ? taskClasses.find(c => c.id === task.classId) : null;
                                        const skill = task.skillId ? skills.find(s => s.id === task.skillId) : null;

                                        return (
                                            <div key={task.id} onClick={(e) => {
                                                if ((e.target as HTMLElement).tagName !== 'INPUT') {
                                                    openEditModal(task);
                                                }
                                            }} className="bg-slate-900 rounded-lg p-4 border border-rose-700/50 cursor-pointer hover:border-rose-600 transition">
                                                <div className="flex items-start gap-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={task.completed}
                                                        onChange={() => toggleTask(task.id, today)}
                                                        className="mt-1 w-5 h-5 rounded border-slate-600 text-rose-600 focus:ring-rose-500"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold">{task.name}</h3>
                                                        {task.description && (
                                                            <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                                                        )}
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            <span className="text-xs px-3 py-1 rounded-full bg-rose-900 text-rose-300 border border-rose-700">
                                                                ⏰ Due: {formatShortDate(task.dueDate || '')}
                                                            </span>
                                                            <span className="text-xs px-3 py-1 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">
                                                                {task.xpReward} XP
                                                            </span>
                                                            {task.priority && <RarityBadge rarity={task.priority} />}
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

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Choose Avatar</label>
                                    <select
                                        value={character.avatar}
                                        onChange={(e) => setCharacter({ ...character, avatar: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        style={{ fontFamily: 'system-ui' }}
                                    >
                                        {AVATARS.map(avatar => (
                                            <option key={avatar} value={avatar}>
                                                {avatar}
                                            </option>
                                        ))}
                                    </select>
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

                            {/* Unspent Points Banner */}
                            {character.unspentPoints > 0 && (
                                <div className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-lg p-4 sm:p-6 border-2 border-yellow-600/50 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-semibold text-yellow-400 flex items-center gap-2">
                                                ⭐ Level Up!
                                            </h3>
                                            <p className="text-sm text-slate-300 mt-1">
                                                You have {character.unspentPoints} unspent {character.unspentPoints === 1 ? 'point' : 'points'}
                                            </p>
                                        </div>
                                        <div className="text-3xl sm:text-4xl font-bold text-yellow-400">
                                            {character.unspentPoints}
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-400">
                                        Click on the <span className="text-yellow-400 font-bold">+</span> button next to any stat below to spend your points!
                                    </p>
                                </div>
                            )}

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
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base sm:text-lg font-bold text-indigo-400">{value}</span>
                                                        {character.unspentPoints > 0 && (
                                                            <button
                                                                onClick={() => spendPoint(stat.key as StatType)}
                                                                className="w-7 h-7 rounded-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold transition flex items-center justify-center shadow-lg hover:shadow-yellow-500/50"
                                                                title="Spend 1 point to increase this stat"
                                                            >
                                                                +
                                                            </button>
                                                        )}
                                                    </div>
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

                        <div className="bg-slate-900 rounded-lg border border-slate-700 mt-6 overflow-hidden">
                            <button
                                onClick={() => setIsSkillPanelOpen(!isSkillPanelOpen)}
                                className="w-full px-4 py-3 flex items-center justify-between bg-slate-900 hover:bg-slate-800 transition-colors text-left"
                            >
                                <h3 className="text-lg font-semibold text-slate-100">Skills Management</h3>
                                <span className="text-xl text-indigo-400">{isSkillPanelOpen ? '▼' : '▶'}</span>
                            </button>

                            {isSkillPanelOpen && (
                                <div className="p-4 border-t border-slate-700">
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
                            )}
                        </div>

                        <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                            <button
                                onClick={() => setIsTaskClassPanelOpen(!isTaskClassPanelOpen)}
                                className="w-full px-4 py-3 flex items-center justify-between bg-slate-900 hover:bg-slate-800 transition-colors text-left"
                            >
                                <h3 className="text-lg font-semibold text-slate-100">Task Classes (map to stats)</h3>
                                <span className="text-xl text-indigo-400">{isTaskClassPanelOpen ? '▼' : '▶'}</span>
                            </button>

                            {isTaskClassPanelOpen && (
                                <div className="p-4 border-t border-slate-700">
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
                            )}
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
                                onClick={() => setShowAboutPage(true)}
                                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 hover:border-indigo-500 transition flex items-center justify-center text-xl"
                                title="Information"
                            >
                                ℹ️
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Data Management - Export/Import */}
                            <DataManagement
                                tasks={tasks}
                                character={character}
                                projects={projects}
                                skills={skills}
                                taskClasses={taskClasses}
                                recurringCompletions={recurringCompletions}
                                onImport={(data) => {
                                    setTasks(data.tasks);
                                    setCharacter(data.character);
                                    setProjects(data.projects);
                                    setSkills(data.skills);
                                    setTaskClasses(data.taskClasses);
                                    setRecurringCompletions(data.recurringCompletions);
                                }}
                            />

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

                                {/* Show Welcome Screen Again */}
                                <div className="mt-4 pt-4 border-t border-rose-700">
                                    <p className="text-rose-200 text-sm mb-3">
                                        Want to see the welcome screen again?
                                    </p>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('hasSeenOnboarding');
                                            setShowOnboarding(true);
                                        }}
                                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition text-sm"
                                    >
                                        🎓 Show Welcome Screen
                                    </button>
                                </div>
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

                                            {/* View Details Button */}
                                            <button
                                                onClick={() => setSelectedProject(project)}
                                                className="w-full mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm font-medium"
                                            >
                                                View All Quests →
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Project Details View - pokazuje się gdy projekt jest wybrany */}
                        {selectedProject && (
                            <div className="fixed inset-0 bg-slate-900 z-40 overflow-y-auto">
                                <div className="max-w-7xl mx-auto p-4 sm:p-6">
                                    {/* Header with Back Button */}
                                    <div className="mb-6">
                                        <button
                                            onClick={() => setSelectedProject(null)}
                                            className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-4"
                                        >
                                            <span className="text-xl">←</span>
                                            <span>Back to Projects</span>
                                        </button>

                                        <div className="bg-slate-800 rounded-xl p-6 border-l-4 border border-slate-700" style={{ borderLeftColor: selectedProject.color }}>
                                            <h1 className="text-3xl font-bold mb-2" style={{ color: selectedProject.color }}>
                                                {selectedProject.name}
                                            </h1>
                                            <p className="text-slate-300 mb-4">{selectedProject.description}</p>

                                            {/* Stats */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {(() => {
                                                    const projectTasks = tasks.filter(t => t.projectId === selectedProject.id);
                                                    const completedTasks = projectTasks.filter(t => t.completed);
                                                    const activeTasks = projectTasks.filter(t => !t.completed);
                                                    const totalXP = projectTasks.reduce((sum, t) => sum + (t.completed ? t.xpReward : 0), 0);

                                                    return (
                                                        <>
                                                            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                                                                <div className="text-2xl font-bold text-slate-100">{projectTasks.length}</div>
                                                                <div className="text-sm text-slate-400">Total Quests</div>
                                                            </div>
                                                            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                                                                <div className="text-2xl font-bold text-indigo-400">{activeTasks.length}</div>
                                                                <div className="text-sm text-slate-400">Active</div>
                                                            </div>
                                                            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                                                                <div className="text-2xl font-bold text-green-400">{completedTasks.length}</div>
                                                                <div className="text-sm text-slate-400">Completed</div>
                                                            </div>
                                                            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                                                                <div className="text-2xl font-bold text-yellow-400">{totalXP}</div>
                                                                <div className="text-sm text-slate-400">XP Earned</div>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tasks List */}
                                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-semibold">All Quests</h2>
                                            <button
                                                onClick={() => {
                                                    setTaskProjectId(selectedProject.id);
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
                                                            onClick={(e) => {
                                                                if ((e.target as HTMLElement).tagName !== 'INPUT') {
                                                                    openEditModal(task);
                                                                }
                                                            }}
                                                            className={`bg-slate-900 rounded-lg p-4 border border-slate-700 cursor-pointer hover:border-slate-600 transition ${task.completed ? 'opacity-60' : ''}`}
                                                        >
                                                            <div className="flex items-start gap-4">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={task.completed}
                                                                    onChange={() => toggleTask(task.id)}
                                                                    className="mt-1 w-5 h-5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                                                />
                                                                <div className="flex-1">
                                                                    <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-slate-500' : ''}`}>
                                                                        {task.name}
                                                                    </h3>
                                                                    {task.description && (
                                                                        <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                                                                    )}
                                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                                        <span className="text-xs px-3 py-1 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">
                                                                            {task.xpReward} XP
                                                                        </span>
                                                                        {task.priority && <RarityBadge rarity={task.priority} />}
                                                                        {task.dueDate && (
                                                                            <span className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                                                                                📅 {formatShortDate(task.dueDate)}
                                                                            </span>
                                                                        )}
                                                                        {task.isFlexible && (
                                                                            <span className="text-xs px-3 py-1 rounded-full bg-teal-900 text-teal-300 border border-teal-700">
                                                                                🕐 Flexible
                                                                            </span>
                                                                        )}
                                                                        {task.isRecurring && (
                                                                            <span className="text-xs px-3 py-1 rounded-full bg-purple-900 text-purple-300 border border-purple-700">
                                                                                🔄 {task.recurringType}
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
                                                });
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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

                                <div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Rarity</label>
                                        <select
                                            value={taskPriority}
                                            onChange={(e) => {
                                                const newRarity = e.target.value as "common" | "rare" | "epic" | "legendary" | "unique";
                                                setTaskPriority(newRarity);
                                                //setTaskXpReward(getRarityXP(newRarity));
                                            }}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                        >
                                            <option value="common">⚪ Common (50 XP)</option>
                                            <option value="rare">🔵 Rare (100 XP)</option>
                                            <option value="epic">🟣 Epic (250 XP)</option>
                                            <option value="legendary">🟠 Legendary (500 XP)</option>
                                            <option value="unique">🟡 Unique (1000 XP)</option>
                                        </select>
                                        <p className="text-xs text-slate-400 mt-2">
                                            XP Reward: <span className="text-indigo-400 font-semibold">{getRarityXP(taskPriority)} XP</span>
                                        </p>
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

                                {/* Project selector - Premium only */}
                                {isPremium && (
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
                                )}

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
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Rarity</label>
                                        <div className="inline-block">
                                            <RarityBadge rarity={viewingTask.priority} showXP={true} />
                                        </div>
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
                                {showStatInfo && STAT_DESCRIPTIONS[showStatInfo as StatType]}
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
            </div>
        </div>
    );
}
