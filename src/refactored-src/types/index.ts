/**
 * Type definitions for TaskQuest application
 */

export type Project = {
    id: string;
    name: string;
    color: string;
    description: string;
};

export type SubTask = {
    id: string;
    name: string;
    completed: boolean;
};

export type Task = {
    id: string;
    projectId: string | null;
    name: string;
    description: string;
    completed: boolean;
    xpReward: number;
    priority: "common" | "rare" | "epic" | "legendary" | "unique";
    dueDate: string; // może być pusty string dla flexible tasks
    subtasks: SubTask[];
    createdAt: string;
    completedAt?: string;
    isRecurring?: boolean;
    recurringType?: "daily" | "weekly" | "monthly";
    recurringDay?: number;
    recurringEndDate?: string;
    statType?: "strength" | "endurance" | "intelligence" | "agility" | "charisma" | null;
    classId?: string | null;
    skillId?: string | null;
    isFlexible?: boolean;
};

export type Character = {
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

export type RecurringTaskCompletion = {
    taskId: string;
    date: string;
    completed: boolean;
};

export type TaskClass = {
    id: string;
    name: string;
    statType: "strength" | "endurance" | "intelligence" | "agility" | "charisma";
    color?: string;
};

export type Skill = {
    id: string;
    name: string;
    level: number;
    progress: number;
    color?: string;
};

export type ViewType = "character" | "activeTasks" | "daily" | "weekly" | "monthly" | "all" | "projects" | "settings";

export type StatType = "strength" | "endurance" | "intelligence" | "agility" | "charisma";
