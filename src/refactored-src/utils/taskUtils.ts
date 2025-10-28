/**
 * Task utility functions
 */

import type { Task, RecurringTaskCompletion } from '../types';
import { getToday } from './dateUtils';

/**
 * Get tasks for a specific date, including recurring tasks
 * @param tasks - Array of all tasks
 * @param date - Date string in YYYY-MM-DD format
 * @returns Filtered array of tasks for the date
 */
export function getTasksForDate(tasks: Task[], date: string): Task[] {
    const today = getToday();

    return tasks.filter(t => {
        if (t.isRecurring) {
            // Recurring tasks don't appear in the past (before today)
            if (date < today) return false;

            // Check if task hasn't exceeded end date (if set)
            if (t.recurringEndDate && date > t.recurringEndDate) return false;

            // Check if task isn't from the past (creation date or due date)
            const taskStartDate = t.dueDate || t.createdAt.slice(0, 10);
            if (date < taskStartDate) return false;

            if (t.recurringType === "daily") return true;
            if (t.recurringType === "weekly") {
                const taskDay = new Date(taskStartDate).getDay();
                const targetDay = new Date(date).getDay();
                return taskDay === targetDay;
            }
            if (t.recurringType === "monthly") {
                const taskDate = new Date(taskStartDate).getDate();
                const targetDate = new Date(date).getDate();
                return taskDate === targetDate;
            }
        }
        return t.dueDate === date;
    });
}

/**
 * Check if a task is completed on a specific date
 * @param task - Task to check
 * @param date - Date string in YYYY-MM-DD format
 * @param recurringCompletions - Array of recurring task completions
 * @returns True if task is completed on the date
 */
export function isTaskCompletedOnDate(
    task: Task,
    date: string,
    recurringCompletions: RecurringTaskCompletion[]
): boolean {
    if (task.isRecurring) {
        const completion = recurringCompletions.find(
            rc => rc.taskId === task.id && rc.date === date
        );
        return completion?.completed || false;
    }
    return task.completed;
}

/**
 * Get active recurring tasks (not ended)
 * @param tasks - Array of all tasks
 * @returns Filtered array of active recurring tasks
 */
export function getActiveRecurringTasks(tasks: Task[]): Task[] {
    const today = getToday();
    return tasks.filter(
        t => t.isRecurring && (!t.recurringEndDate || t.recurringEndDate >= today)
    );
}

/**
 * Get flexible tasks (tasks without due date)
 * @param tasks - Array of all tasks
 * @returns Filtered array of flexible tasks
 */
export function getFlexibleTasks(tasks: Task[]): Task[] {
    return tasks.filter(t => !t.completed && t.isFlexible);
}

/**
 * Get tasks for today (non-recurring only)
 * @param tasks - Array of all tasks
 * @param date - Today's date
 * @returns Filtered array of today's tasks
 */
export function getTodayTasks(tasks: Task[], date: string): Task[] {
    return tasks.filter(t => !t.completed && t.dueDate === date && !t.isRecurring);
}

/**
 * Get tasks for tomorrow (non-recurring only)
 * @param tasks - Array of all tasks
 * @param date - Tomorrow's date
 * @returns Filtered array of tomorrow's tasks
 */
export function getTomorrowTasks(tasks: Task[], date: string): Task[] {
    return tasks.filter(t => !t.completed && t.dueDate === date && !t.isRecurring);
}

/**
 * Sort tasks by completion status and creation date
 * @param tasks - Array of tasks to sort
 * @returns Sorted array of tasks
 */
export function sortTasks(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

/**
 * Generate a random color for projects, classes, and skills
 * @returns HSL color string
 */
export function generateRandomColor(): string {
    return `hsl(${Math.random() * 360}, 70%, 60%)`;
}

/**
 * Create a new task with default values
 * @param overrides - Properties to override defaults
 * @returns New task object
 */
export function createNewTask(overrides: Partial<Task> = {}): Task {
    return {
        id: Date.now().toString(),
        projectId: null,
        name: "",
        description: "",
        completed: false,
        xpReward: 50,
        priority: "medium",
        dueDate: "",
        subtasks: [],
        createdAt: new Date().toISOString(),
        ...overrides
    };
}

/**
 * Toggle recurring task completion for a specific date
 * @param taskId - ID of the recurring task
 * @param date - Date to toggle
 * @param recurringCompletions - Array of recurring task completions
 * @returns Updated array of recurring task completions
 */
export function toggleRecurringTaskCompletion(
    taskId: string,
    date: string,
    recurringCompletions: RecurringTaskCompletion[]
): RecurringTaskCompletion[] {
    const existing = recurringCompletions.find(
        rc => rc.taskId === taskId && rc.date === date
    );

    if (existing) {
        return recurringCompletions.map(rc =>
            rc.taskId === taskId && rc.date === date
                ? { ...rc, completed: !rc.completed }
                : rc
        );
    } else {
        return [...recurringCompletions, { taskId, date, completed: true }];
    }
}
