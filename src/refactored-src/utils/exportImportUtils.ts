/**
 * Export/Import Utilities for TaskQuest
 * Simple JSON-based backup and restore system
 */

import type { Task, Character, Project, Skill, TaskClass, RecurringTaskCompletion } from '../types';

export interface AppData {
    version: string;
    exportDate: string;
    data: {
        tasks: Task[];
        character: Character;
        projects: Project[];
        skills: Skill[];
        taskClasses: TaskClass[];
        recurringCompletions: RecurringTaskCompletion[];
    };
}

/**
 * Export all app data to JSON
 */
export function exportToJSON(
    tasks: Task[],
    character: Character,
    projects: Project[],
    skills: Skill[],
    taskClasses: TaskClass[],
    recurringCompletions: RecurringTaskCompletion[]
): string {
    const appData: AppData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
            tasks,
            character,
            projects,
            skills,
            taskClasses,
            recurringCompletions,
        },
    };

    return JSON.stringify(appData, null, 2);
}

/**
 * Download JSON file
 */
export function downloadJSON(jsonString: string, filename: string = 'taskquest-backup.json') {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Parse and validate imported JSON
 */
export function parseImportedJSON(jsonString: string): AppData | null {
    try {
        const data = JSON.parse(jsonString) as AppData;

        // Basic validation
        if (!data.version || !data.exportDate || !data.data) {
            throw new Error('Invalid backup file format');
        }

        // Validate required fields
        if (!data.data.tasks || !data.data.character) {
            throw new Error('Missing required data');
        }

        return data;
    } catch (error) {
        console.error('Parse error:', error);
        return null;
    }
}

/**
 * Get statistics from app data
 */
export function getDataStatistics(
    tasks: Task[],
    character: Character,
    projects: Project[],
    skills: Skill[],
    taskClasses: TaskClass[]
) {
    const completedTasks = tasks.filter(t => t.completed).length;
    const activeTasks = tasks.length - completedTasks;
    const totalXP = character.totalXp;
    const level = character.level;

    return {
        totalTasks: tasks.length,
        completedTasks,
        activeTasks,
        totalXP,
        level,
        projects: projects.length,
        skills: skills.length,
        taskClasses: taskClasses.length,
    };
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(): string {
    const date = new Date();
    const timestamp = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `taskquest-backup-${timestamp}.json`;
}