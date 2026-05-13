/**
 * AppContext — centralne źródło stanu i logiki biznesowej TaskQuest
 *
 * Zmiany v2:
 * - System Gold: nagrody za zadania, pole character.gold / totalGold
 * - Odblokowanie Skills/TaskClasses za rosnący koszt gold
 * - Modal potwierdzenia usunięcia zadania (bez kosztu gold)
 * - saveTask przypisuje goldReward automatycznie z priority
 * - awardXP przyjmuje teraz też gold
 */

import {
    createContext, useContext, useState, useEffect, useMemo, type ReactNode
} from "react";

import type {
    Task, Character, Project, TaskClass, Skill,
    RecurringTaskCompletion, ViewType, StatType,
} from "../types";

import { DEFAULT_CHARACTER, getUnlockCost } from "../constants";

import {
    getWeekDates, getMonthDates, getToday, getTomorrow, addDays, addMonths,
    getTasksForDate, isTaskCompletedOnDate, sortTasks,
    generateRandomColor, toggleRecurringTaskCompletion,
    calculateXpForLevel, getRarityXP, getRarityGold,
    awardXP as awardXPUtil, spendGold,
    usePersistedState,
} from "../utils";

// ─── Typy ────────────────────────────────────────────────────────────────────

export type LevelUpData = {
    type: "character" | "stat" | "skill";
    name: string;
    oldLevel: number;
    newLevel: number;
    color?: string;
};

export type TaskFormState = {
    taskName: string;
    taskDescription: string;
    taskPriority: "common" | "rare" | "epic" | "legendary" | "unique";
    taskDueDate: string;
    taskProjectId: string;
    taskIsRecurring: boolean;
    taskRecurringType: "daily" | "weekly" | "monthly";
    taskRecurringDay: number;
    taskRecurringEndDate: string;
    taskClassId: string;
    taskSkillId: string;
    taskIsFlexible: boolean;
};

export type AppContextValue = {
    // ── Dane ──────────────────────────────────────────────────────────────────
    tasks: Task[];
    projects: Project[];
    taskClasses: TaskClass[];
    skills: Skill[];
    character: Character;
    updateCharacter: (patch: Partial<Character>) => void;
    recurringCompletions: RecurringTaskCompletion[];

    // ── Stan widoku ───────────────────────────────────────────────────────────
    view: ViewType;
    setView: (v: ViewType) => void;
    selectedDate: string;
    setSelectedDate: (d: string) => void;
    selectedMonth: string;
    setSelectedMonth: (m: string) => void;
    isPremium: boolean;

    // ── Nawigacja datowa ──────────────────────────────────────────────────────
    goToPreviousWeek: () => void;
    goToNextWeek: () => void;
    goToPreviousMonth: () => void;
    goToNextMonth: () => void;

    // ── Computed values ───────────────────────────────────────────────────────
    today: string;
    tomorrow: string;
    weekDates: string[];
    monthDates: string[];
    xpForNextLevel: number;
    sortedTasks: Task[];
    sortedDailyTasks: Task[];
    sortedTodayTasks: Task[];
    sortedTomorrowTasks: Task[];
    sortedBacklogTasks: Task[];
    sortedNoDueDateTasks: Task[];

    // ── Gold system ───────────────────────────────────────────────────────────
    /** Koszt odblokowania następnego slotu Skill (0 = darmowy) */
    nextSkillUnlockCost: number;
    /** Koszt odblokowania następnego slotu TaskClass (0 = darmowy) */
    nextClassUnlockCost: number;
    /** Czy stać gracza na kolejny Skill */
    canAffordSkill: boolean;
    /** Czy stać gracza na kolejny TaskClass */
    canAffordClass: boolean;
    unlockSkillSlot: () => boolean;
    unlockClassSlot: () => boolean;
    /** Ile slotów Skill zostało odblokowanych (włącznie z darmowym) */
    unlockedSkillSlots: number;
    /** Ile slotów TaskClass zostało odblokowanych (włącznie z darmowym) */
    unlockedClassSlots: number;

    // ── Modal state ───────────────────────────────────────────────────────────
    showTaskModal: boolean;
    editingTask: Task | null;
    showCompletedTaskModal: boolean;
    viewingTask: Task | null;
    showResetConfirm: boolean;
    setShowResetConfirm: (v: boolean) => void;
    showStatInfo: string | null;
    setShowStatInfo: (v: string | null) => void;
    showMobileMenu: boolean;
    setShowMobileMenu: (v: boolean) => void;
    showAboutPage: boolean;
    setShowAboutPage: (v: boolean) => void;
    showOnboarding: boolean;
    selectedDayModal: Date | null;
    setSelectedDayModal: (d: Date | null) => void;
    selectedProject: Project | null;
    setSelectedProject: (p: Project | null) => void;
    showEditProjectModal: boolean;
    editingProject: Project | null;
    levelUpQueue: LevelUpData[];
    popLevelUp: () => void;
    /** ID zadania oczekującego na potwierdzenie usunięcia */
    pendingDeleteTaskId: string | null;
    setPendingDeleteTaskId: (id: string | null) => void;
    confirmDeleteTask: () => void;

    // ── Collapsible panels ────────────────────────────────────────────────────
    isSkillPanelOpen: boolean;
    setIsSkillPanelOpen: (v: boolean) => void;
    isTaskClassPanelOpen: boolean;
    setIsTaskClassPanelOpen: (v: boolean) => void;
    showCompletedQuests: boolean;
    setShowCompletedQuests: (v: boolean) => void;

    // ── Task form ─────────────────────────────────────────────────────────────
    taskForm: TaskFormState;
    setTaskForm: (patch: Partial<TaskFormState>) => void;
    newCommentText: string;
    setNewCommentText: (v: string) => void;

    // ── Project form ──────────────────────────────────────────────────────────
    newProjectName: string;
    setNewProjectName: (v: string) => void;
    newProjectDesc: string;
    setNewProjectDesc: (v: string) => void;
    editProjectName: string;
    setEditProjectName: (v: string) => void;
    editProjectDesc: string;
    setEditProjectDesc: (v: string) => void;

    // ── Class & skill form ────────────────────────────────────────────────────
    newClassName: string;
    setNewClassName: (v: string) => void;
    newClassStat: StatType;
    setNewClassStat: (v: StatType) => void;
    newSkillName: string;
    setNewSkillName: (v: string) => void;

    // ── All tasks filters ─────────────────────────────────────────────────────
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    filterDate: string;
    setFilterDate: (v: string) => void;
    customDateFrom: string;
    setCustomDateFrom: (v: string) => void;
    customDateTo: string;
    setCustomDateTo: (v: string) => void;
    filterPriority: string;
    setFilterPriority: (v: string) => void;
    filterProject: string;
    setFilterProject: (v: string) => void;

    // ── Akcje ─────────────────────────────────────────────────────────────────
    openTaskModal: (date?: string) => void;
    openEditModal: (task: Task) => void;
    closeTaskModal: () => void;
    saveTask: () => void;
    requestDeleteTask: (id: string) => void;
    toggleTask: (id: string, date?: string) => void;
    addCommentToTask: (taskId: string) => void;
    openCompletedTaskView: (task: Task) => void;
    closeCompletedTaskModal: () => void;
    spendPoint: (stat: StatType) => void;
    addProject: () => void;
    deleteProject: (id: string) => void;
    openEditProjectModal: (project: Project) => void;
    saveProjectEdit: () => void;
    addTaskClass: () => void;
    deleteTaskClass: (id: string) => void;
    addSkill: () => void;
    deleteSkill: (id: string) => void;
    resetProgress: () => void;
    handleOnboardingComplete: () => void;
    importData: (data: {
        tasks: Task[];
        character: Character;
        projects: Project[];
        skills: Skill[];
        taskClasses: TaskClass[];
        recurringCompletions: RecurringTaskCompletion[];
    }) => void;
};

// ─── Default form state ───────────────────────────────────────────────────────

const DEFAULT_TASK_FORM: TaskFormState = {
    taskName: "",
    taskDescription: "",
    taskPriority: "common",
    taskDueDate: "",
    taskProjectId: "",
    taskIsRecurring: false,
    taskRecurringType: "daily",
    taskRecurringDay: 1,
    taskRecurringEndDate: "",
    taskClassId: "",
    taskSkillId: "",
    taskIsFlexible: false,
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
    // ── Persisted state ───────────────────────────────────────────────────────
    const [tasks, setTasks] = usePersistedState<Task[]>("tasks", []);
    const [projects, setProjects] = usePersistedState<Project[]>("projects", []);
    const [taskClasses, setTaskClasses] = usePersistedState<TaskClass[]>("taskClasses", []);
    const [skills, setSkills] = usePersistedState<Skill[]>("skills", []);
    const [character, setCharacter] = usePersistedState<Character>("character", DEFAULT_CHARACTER);
    const [recurringCompletions, setRecurringCompletions] = usePersistedState<RecurringTaskCompletion[]>(
        "recurringCompletions", []
    );

    /**
     * Liczba odblokowanych slotów — persisted osobno,
     * żeby nie tracić przy reset (gracze płacili gold).
     * Reset całkowity i tak zeruje.
     */
    const [unlockedSkillSlots, setUnlockedSkillSlots] = usePersistedState<number>("unlockedSkillSlots", 1);
    const [unlockedClassSlots, setUnlockedClassSlots] = usePersistedState<number>("unlockedClassSlots", 1);

    // ── Migracja: stare priorytety + brakujące pola gold ─────────────────────
    useEffect(() => {
        const OLD: Record<string, Task["priority"]> = { low: "common", medium: "rare", high: "epic" };
        const migrated = tasks.map(t => {
            const mapped = OLD[t.priority as string];
            const withPriority = mapped ? { ...t, priority: mapped } : t;
            // Dodaj goldReward jeśli brakuje (stare zadania)
            if (withPriority.goldReward === undefined) {
                return { ...withPriority, goldReward: getRarityGold(withPriority.priority) };
            }
            return withPriority;
        });
        const needsMigration = migrated.some((t, i) =>
            t.priority !== tasks[i].priority || t.goldReward !== tasks[i].goldReward
        );
        if (needsMigration) setTasks(migrated as Task[]);

        // Migracja character — dodaj gold/totalGold jeśli brakuje
        if ((character as any).gold === undefined) {
            setCharacter({ ...character, gold: 0, totalGold: 0 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [view, setView] = useState<ViewType>("character");
    const [selectedDate, setSelectedDate] = useState(getToday());
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showCompletedTaskModal, setShowCompletedTaskModal] = useState(false);
    const [viewingTask, setViewingTask] = useState<Task | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showAboutPage, setShowAboutPage] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showStatInfo, setShowStatInfo] = useState<string | null>(null);
    const [selectedDayModal, setSelectedDayModal] = useState<Date | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isSkillPanelOpen, setIsSkillPanelOpen] = useState(false);
    const [isTaskClassPanelOpen, setIsTaskClassPanelOpen] = useState(false);
    const [showCompletedQuests, setShowCompletedQuests] = useState(false);
    const [levelUpQueue, setLevelUpQueue] = useState<LevelUpData[]>([]);
    const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<string | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("hasSeenOnboarding"));

    const isPremium = true;

    const [taskForm, setTaskFormState] = useState<TaskFormState>(DEFAULT_TASK_FORM);
    function setTaskForm(patch: Partial<TaskFormState>) {
        setTaskFormState(prev => ({ ...prev, ...patch }));
    }

    const [newCommentText, setNewCommentText] = useState("");
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");
    const [editProjectName, setEditProjectName] = useState("");
    const [editProjectDesc, setEditProjectDesc] = useState("");
    const [newClassName, setNewClassName] = useState("");
    const [newClassStat, setNewClassStat] = useState<StatType>("strength");
    const [newSkillName, setNewSkillName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterDate, setFilterDate] = useState("all");
    const [customDateFrom, setCustomDateFrom] = useState("");
    const [customDateTo, setCustomDateTo] = useState("");
    const [filterPriority, setFilterPriority] = useState("all");
    const [filterProject, setFilterProject] = useState("all");

    // ── Computed values ───────────────────────────────────────────────────────
    const today = getToday();
    const tomorrow = getTomorrow();
    const weekDates = getWeekDates(selectedDate);
    const monthDates = useMemo(() => getMonthDates(selectedMonth), [selectedMonth]);
    const xpForNextLevel = calculateXpForLevel(character.level);
    const sortedTasks = sortTasks(tasks);
    const dailyTasks = getTasksForDate(tasks, selectedDate);
    const sortedDailyTasks = sortTasks(dailyTasks);
    const todayTasks = getTasksForDate(tasks, today);
    const sortedTodayTasks = sortTasks(
        todayTasks.filter(t =>
            t.isRecurring ? !isTaskCompletedOnDate(t, today, recurringCompletions) : !t.completed
        )
    );
    const sortedTomorrowTasks = sortTasks(
        tasks.filter(t => !t.completed && t.dueDate === tomorrow && !t.isRecurring)
    );
    const sortedBacklogTasks = sortTasks(
        tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today && !t.isRecurring)
    );
    const sortedNoDueDateTasks = sortTasks(
        tasks.filter(t => !t.completed && !t.dueDate && !t.isRecurring)
    );

    // ── Gold computed ─────────────────────────────────────────────────────────
    const nextSkillUnlockCost = getUnlockCost(unlockedSkillSlots);
    const nextClassUnlockCost = getUnlockCost(unlockedClassSlots);
    const canAffordSkill = character.gold >= nextSkillUnlockCost;
    const canAffordClass = character.gold >= nextClassUnlockCost;

    // ── Nawigacja ─────────────────────────────────────────────────────────────
    function goToPreviousWeek() { setSelectedDate(addDays(selectedDate, -7)); }
    function goToNextWeek() { setSelectedDate(addDays(selectedDate, 7)); }
    function goToPreviousMonth() { setSelectedMonth(addMonths(selectedMonth, -1)); }
    function goToNextMonth() { setSelectedMonth(addMonths(selectedMonth, 1)); }

    // ── Level up queue ────────────────────────────────────────────────────────
    function enqueueLevelUp(data: LevelUpData) {
        setLevelUpQueue(prev => [...prev, data]);
    }
    function popLevelUp() {
        setLevelUpQueue(prev => prev.slice(1));
    }

    // ── Award XP + Gold ───────────────────────────────────────────────────────
    function handleAwardXP(xp: number, gold: number, task: Task) {
        const prevCharacter = { ...character };
        const prevSkills = skills.map(s => ({ ...s }));

        const result = awardXPUtil(character, xp, gold, task, taskClasses, skills);

        setCharacter(result.character);
        setSkills(result.skills);

        // Awans postaci
        if (result.character.level > prevCharacter.level) {
            enqueueLevelUp({
                type: "character",
                name: result.character.name,
                oldLevel: prevCharacter.level,
                newLevel: result.character.level,
                color: "#FF6B4A",
            });
        }

        // Wzrost statów
        const statKeys: StatType[] = ["strength", "endurance", "intelligence", "agility", "charisma"];
        for (const stat of statKeys) {
            if ((result.character[stat] as number) > (prevCharacter[stat] as number)) {
                enqueueLevelUp({
                    type: "stat",
                    name: stat.charAt(0).toUpperCase() + stat.slice(1),
                    oldLevel: prevCharacter[stat] as number,
                    newLevel: result.character[stat] as number,
                    color: "#10B981",
                });
            }
        }

        // Awans skilli
        for (const updated of result.skills) {
            const prev = prevSkills.find(s => s.id === updated.id);
            if (prev && updated.level > prev.level) {
                enqueueLevelUp({
                    type: "skill",
                    name: updated.name,
                    oldLevel: prev.level,
                    newLevel: updated.level,
                    color: updated.color,
                });
            }
        }
    }

    // ── Gold unlock ───────────────────────────────────────────────────────────

    /** Odblokuj kolejny slot Skill. Zwraca true jeśli sukces. */
    function unlockSkillSlot(): boolean {
        const cost = nextSkillUnlockCost;
        if (cost === 0) { setUnlockedSkillSlots(s => s + 1); return true; }
        const updated = spendGold(character, cost);
        if (!updated) return false;
        setCharacter(updated);
        setUnlockedSkillSlots(s => s + 1);
        return true;
    }

    /** Odblokuj kolejny slot TaskClass. Zwraca true jeśli sukces. */
    function unlockClassSlot(): boolean {
        const cost = nextClassUnlockCost;
        if (cost === 0) { setUnlockedClassSlots(s => s + 1); return true; }
        const updated = spendGold(character, cost);
        if (!updated) return false;
        setCharacter(updated);
        setUnlockedClassSlots(s => s + 1);
        return true;
    }

    // ── Onboarding ────────────────────────────────────────────────────────────
    function handleOnboardingComplete() {
        localStorage.setItem("hasSeenOnboarding", "true");
        setShowOnboarding(false);
    }

    // ── Modal helpers ─────────────────────────────────────────────────────────
    function openTaskModal(date?: string) {
        setEditingTask(null);
        setTaskFormState({ ...DEFAULT_TASK_FORM, taskDueDate: date ?? selectedDate });
        setShowTaskModal(true);
    }

    function openEditModal(task: Task) {
        setEditingTask(task);
        setTaskFormState({
            taskName: task.name,
            taskDescription: task.description,
            taskPriority: task.priority,
            taskDueDate: task.dueDate,
            taskProjectId: task.projectId ?? "",
            taskIsRecurring: task.isRecurring ?? false,
            taskRecurringType: task.recurringType ?? "daily",
            taskRecurringDay: task.recurringDay ?? 1,
            taskRecurringEndDate: task.recurringEndDate ?? "",
            taskClassId: task.classId ?? "",
            taskSkillId: task.skillId ?? "",
            taskIsFlexible: task.isFlexible ?? false,
        });
        setShowTaskModal(true);
    }

    function closeTaskModal() {
        setShowTaskModal(false);
        setEditingTask(null);
    }

    function openCompletedTaskView(task: Task) {
        setViewingTask(task);
        setShowCompletedTaskModal(true);
    }

    function closeCompletedTaskModal() {
        setShowCompletedTaskModal(false);
        setViewingTask(null);
        setNewCommentText("");
    }

    // ── Task CRUD ─────────────────────────────────────────────────────────────
    function saveTask() {
        const {
            taskName, taskDescription, taskPriority, taskDueDate,
            taskProjectId, taskIsRecurring, taskRecurringType,
            taskRecurringDay, taskRecurringEndDate, taskClassId,
            taskSkillId, taskIsFlexible,
        } = taskForm;

        if (!taskName.trim()) return;

        const taskData: Task = {
            id: editingTask?.id ?? crypto.randomUUID(),
            projectId: taskProjectId || null,
            name: taskName,
            description: taskDescription,
            comments: editingTask?.comments ?? [],
            completed: editingTask?.completed ?? false,
            completedAt: editingTask?.completedAt,
            xpReward: getRarityXP(taskPriority),
            goldReward: getRarityGold(taskPriority),
            priority: taskPriority,
            dueDate: taskIsFlexible ? "" : taskDueDate,
            subtasks: editingTask?.subtasks ?? [],
            createdAt: editingTask?.createdAt ?? new Date().toISOString(),
            isRecurring: taskIsRecurring,
            recurringType: taskIsRecurring ? taskRecurringType : undefined,
            recurringDay: taskIsRecurring && taskRecurringType !== "daily" ? taskRecurringDay : undefined,
            recurringEndDate: taskIsRecurring && taskRecurringEndDate ? taskRecurringEndDate : undefined,
            classId: taskClassId || null,
            skillId: taskSkillId || null,
            isFlexible: taskIsFlexible,
        };

        setTasks(editingTask
            ? tasks.map(t => t.id === editingTask.id ? taskData : t)
            : [...tasks, taskData]
        );
        closeTaskModal();
    }

    /** Prosi o potwierdzenie przed usunięciem — otwiera modal */
    function requestDeleteTask(taskId: string) {
        setPendingDeleteTaskId(taskId);
    }

    /** Wykonuje usunięcie po potwierdzeniu */
    function confirmDeleteTask() {
        if (!pendingDeleteTaskId) return;
        setTasks(tasks.filter(t => t.id !== pendingDeleteTaskId));
        setPendingDeleteTaskId(null);
    }

    function toggleTask(taskId: string, date?: string) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        if (task.isRecurring && date) {
            const updatedCompletions = toggleRecurringTaskCompletion(taskId, date, recurringCompletions);
            setRecurringCompletions(updatedCompletions);

            const isCompleting = !recurringCompletions.find(
                rc => rc.taskId === taskId && rc.date === date
            )?.completed;
            if (isCompleting) handleAwardXP(task.xpReward, task.goldReward ?? getRarityGold(task.priority), task);
        } else {
            const wasCompleted = task.completed;
            setTasks(tasks.map(t =>
                t.id === taskId
                    ? {
                        ...t,
                        completed: !t.completed,
                        completedAt: !t.completed ? new Date().toISOString() : undefined,
                        dueDate: t.isFlexible && !t.completed ? date ?? today : t.dueDate,
                    }
                    : t
            ));
            if (!wasCompleted) handleAwardXP(task.xpReward, task.goldReward ?? getRarityGold(task.priority), task);
        }
    }

    function addCommentToTask(taskId: string) {
        if (!newCommentText.trim()) return;
        const updatedTasks = tasks.map(t => {
            if (t.id !== taskId) return t;
            return {
                ...t,
                comments: [
                    ...(t.comments ?? []),
                    { id: crypto.randomUUID(), text: newCommentText.trim(), createdAt: new Date().toISOString() },
                ],
            };
        });
        setTasks(updatedTasks);
        const updated = updatedTasks.find(t => t.id === taskId) ?? null;
        if (editingTask?.id === taskId) setEditingTask(updated);
        if (viewingTask?.id === taskId) setViewingTask(updated);
        setNewCommentText("");
    }

    // ── Character ─────────────────────────────────────────────────────────────
    function spendPoint(stat: StatType) {
        if (character.unspentPoints <= 0) return;
        setCharacter({
            ...character,
            unspentPoints: character.unspentPoints - 1,
            [stat]: (character[stat] as number) + 1,
        });
    }

    // ── Projects ──────────────────────────────────────────────────────────────
    function addProject() {
        if (!newProjectName.trim()) return;
        setProjects([...projects, {
            id: crypto.randomUUID(),
            name: newProjectName,
            color: generateRandomColor(),
            description: newProjectDesc,
        }]);
        setNewProjectName("");
        setNewProjectDesc("");
    }

    function deleteProject(projectId: string) {
        setProjects(projects.filter(p => p.id !== projectId));
        setTasks(tasks.map(t => t.projectId === projectId ? { ...t, projectId: null } : t));
    }

    function openEditProjectModal(project: Project) {
        setEditingProject(project);
        setEditProjectName(project.name);
        setEditProjectDesc(project.description);
        setShowEditProjectModal(true);
    }

    function saveProjectEdit() {
        if (!editingProject || !editProjectName.trim()) return;
        const updated = { ...editingProject, name: editProjectName, description: editProjectDesc };
        setProjects(projects.map(p => p.id === editingProject.id ? updated : p));
        if (selectedProject?.id === editingProject.id) setSelectedProject(updated);
        setShowEditProjectModal(false);
        setEditingProject(null);
        setEditProjectName("");
        setEditProjectDesc("");
    }

    // ── Task classes ──────────────────────────────────────────────────────────
    function addTaskClass() {
        if (!newClassName.trim()) return;
        if (taskClasses.length >= unlockedClassSlots) return; // slot niedostępny
        setTaskClasses([...taskClasses, {
            id: crypto.randomUUID(),
            name: newClassName,
            statType: newClassStat,
            color: generateRandomColor(),
        }]);
        setNewClassName("");
    }

    function deleteTaskClass(classId: string) {
        setTaskClasses(taskClasses.filter(c => c.id !== classId));
        setTasks(tasks.map(t => t.classId === classId ? { ...t, classId: null } : t));
    }

    // ── Skills ────────────────────────────────────────────────────────────────
    function addSkill() {
        if (!newSkillName.trim()) return;
        if (skills.length >= unlockedSkillSlots) return; // slot niedostępny
        setSkills([...skills, {
            id: crypto.randomUUID(),
            name: newSkillName,
            level: 1,
            progress: 0,
            color: generateRandomColor(),
        }]);
        setNewSkillName("");
    }

    function deleteSkill(skillId: string) {
        setSkills(skills.filter(s => s.id !== skillId));
        setTasks(tasks.map(t => t.skillId === skillId ? { ...t, skillId: null } : t));
    }

    // ── Reset & Import ────────────────────────────────────────────────────────
    function resetProgress() {
        setTasks([]);
        setProjects([]);
        setTaskClasses([]);
        setSkills([]);
        setCharacter(DEFAULT_CHARACTER);
        setRecurringCompletions([]);
        setUnlockedSkillSlots(1);
        setUnlockedClassSlots(1);
        setShowResetConfirm(false);
    }

    function importData(data: {
        tasks: Task[];
        character: Character;
        projects: Project[];
        skills: Skill[];
        taskClasses: TaskClass[];
        recurringCompletions: RecurringTaskCompletion[];
    }) {
        setTasks(data.tasks);
        setCharacter(data.character);
        setProjects(data.projects);
        setSkills(data.skills);
        setTaskClasses(data.taskClasses);
        setRecurringCompletions(data.recurringCompletions);
    }

    // ── Character update ─────────────────────────────────────────────────────
    function updateCharacter(patch: Partial<Character>) {
        setCharacter(prev => ({ ...prev, ...patch }));
    }

    // ── Context value ─────────────────────────────────────────────────────────
    const value: AppContextValue = {
        tasks, projects, taskClasses, skills, character, updateCharacter, recurringCompletions,
        view, setView, selectedDate, setSelectedDate, selectedMonth, setSelectedMonth, isPremium,
        goToPreviousWeek, goToNextWeek, goToPreviousMonth, goToNextMonth,
        today, tomorrow, weekDates, monthDates, xpForNextLevel,
        sortedTasks, sortedDailyTasks, sortedTodayTasks, sortedTomorrowTasks,
        sortedBacklogTasks, sortedNoDueDateTasks,
        nextSkillUnlockCost, nextClassUnlockCost, canAffordSkill, canAffordClass,
        unlockSkillSlot, unlockClassSlot, unlockedSkillSlots, unlockedClassSlots,
        showTaskModal, editingTask,
        showCompletedTaskModal, viewingTask,
        showResetConfirm, setShowResetConfirm,
        showStatInfo, setShowStatInfo,
        showMobileMenu, setShowMobileMenu,
        showAboutPage, setShowAboutPage,
        showOnboarding,
        selectedDayModal, setSelectedDayModal,
        selectedProject, setSelectedProject,
        showEditProjectModal, editingProject,
        levelUpQueue, popLevelUp,
        pendingDeleteTaskId, setPendingDeleteTaskId,
        isSkillPanelOpen, setIsSkillPanelOpen,
        isTaskClassPanelOpen, setIsTaskClassPanelOpen,
        showCompletedQuests, setShowCompletedQuests,
        taskForm, setTaskForm,
        newCommentText, setNewCommentText,
        newProjectName, setNewProjectName,
        newProjectDesc, setNewProjectDesc,
        editProjectName, setEditProjectName,
        editProjectDesc, setEditProjectDesc,
        newClassName, setNewClassName,
        newClassStat, setNewClassStat,
        newSkillName, setNewSkillName,
        searchQuery, setSearchQuery,
        filterDate, setFilterDate,
        customDateFrom, setCustomDateFrom,
        customDateTo, setCustomDateTo,
        filterPriority, setFilterPriority,
        filterProject, setFilterProject,
        openTaskModal, openEditModal, closeTaskModal, saveTask,
        requestDeleteTask, confirmDeleteTask,
        toggleTask, addCommentToTask,
        openCompletedTaskView, closeCompletedTaskModal,
        spendPoint,
        addProject, deleteProject, openEditProjectModal, saveProjectEdit,
        addTaskClass, deleteTaskClass,
        addSkill, deleteSkill,
        resetProgress, handleOnboardingComplete, importData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useAppContext must be used within <AppProvider>");
    return ctx;
}
