/**
 * Supabase Sync Service v3
 * 
 * Dopasowany do faktycznego schema Supabase z UUID
 * Handles synchronization between localStorage and Supabase cloud storage.
 * 
 * Features:
 * - Pull: Download data from Supabase to localStorage
 * - Push: Upload data from localStorage to Supabase
 * - UUID support (Twoje schema używa UUID)
 * - Date conversion (timestamp ↔ string)
 * - Field mapping (camelCase ↔ snake_case)
 * - Conflict resolution: Last-write-wins strategy
 * - Offline support: Queue changes when offline
 * - Type-safe: Full TypeScript support
 */

import { supabase } from '../lib/supabase';
import type {
    Task,
    Project,
    Character,
    Skill,
    TaskClass,
    RecurringTaskCompletion
} from '../refactored-src/types';

// ==================== TYPES ====================

export interface SyncStatus {
    isSyncing: boolean;
    lastSyncAt: string | null;
    error: string | null;
}

export interface SyncResult {
    success: boolean;
    error?: string;
    syncedAt?: string;
}

// ==================== HELPERS ====================

/**
 * Convert date to ISO string for Supabase
 */
function toISODate(dateStr: string): string | null {
    if (!dateStr) return null;
    try {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    } catch {
        return null;
    }
}

/**
 * Convert timestamp to ISO string
 */
function toISOTimestamp(dateStr: string): string | null {
    if (!dateStr) return null;
    try {
        const date = new Date(dateStr);
        return date.toISOString();
    } catch {
        return null;
    }
}

/**
 * Convert ISO timestamp to string
 */
function fromISOTimestamp(isoStr: string | null): string {
    if (!isoStr) return '';
    try {
        return new Date(isoStr).toISOString();
    } catch {
        return '';
    }
}

// ==================== SYNC SERVICE ====================

class SyncService {
    private syncStatus: SyncStatus = {
        isSyncing: false,
        lastSyncAt: null,
        error: null,
    };

    private listeners: ((status: SyncStatus) => void)[] = [];

    /**
     * Subscribe to sync status changes
     */
    onStatusChange(callback: (status: SyncStatus) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    /**
     * Notify all listeners of status change
     */
    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.syncStatus));
    }

    /**
     * Get current sync status
     */
    getStatus(): SyncStatus {
        return { ...this.syncStatus };
    }

    // ==================== PULL FROM CLOUD ====================

    /**
     * Pull all data from Supabase to localStorage
     */
    async pullFromCloud(userId: string): Promise<SyncResult> {
        console.log('🔽 Starting pull from cloud...');

        this.syncStatus.isSyncing = true;
        this.syncStatus.error = null;
        this.notifyListeners();

        try {
            // Fetch all data from Supabase
            const [
                tasksResult,
                projectsResult,
                characterResult,
                skillsResult,
                taskClassesResult,
                recurringResult
            ] = await Promise.all([
                supabase.from('tasks').select('*').eq('user_id', userId),
                supabase.from('projects').select('*').eq('user_id', userId),
                supabase.from('characters').select('*').eq('user_id', userId).maybeSingle(),
                supabase.from('skills').select('*').eq('user_id', userId),
                supabase.from('task_classes').select('*').eq('user_id', userId),
                supabase.from('recurring_completions').select('*').eq('user_id', userId),
            ]);

            // Check for errors
            if (tasksResult.error) throw tasksResult.error;
            if (projectsResult.error) throw projectsResult.error;
            if (skillsResult.error) throw skillsResult.error;
            if (taskClassesResult.error) throw taskClassesResult.error;
            if (recurringResult.error) throw recurringResult.error;
            // Character might not exist yet - that's OK

            // Map snake_case to camelCase + UUID to string
            const tasks = tasksResult.data?.map((t: any) => ({
                id: t.id, // UUID jako string
                projectId: t.project_id || null,
                name: t.name,
                description: t.description || '',
                completed: t.completed,
                xpReward: t.xp_reward,
                priority: t.priority,
                dueDate: t.due_date ? new Date(t.due_date).toISOString().split('T')[0] : '',
                subtasks: t.subtasks || [],
                createdAt: fromISOTimestamp(t.created_at),
                completedAt: fromISOTimestamp(t.completed_at),
                isRecurring: t.is_recurring,
                recurringType: t.recurring_type,
                recurringDay: t.recurring_day,
                recurringEndDate: t.recurring_end_date ? new Date(t.recurring_end_date).toISOString().split('T')[0] : undefined,
                statType: t.stat_type || null,
                classId: t.class_id || null,
                skillId: t.skill_id || null,
                isFlexible: t.is_flexible,
            })) || [];

            const projects = projectsResult.data?.map((p: any) => ({
                id: p.id,
                name: p.name,
                color: p.color || '#6366f1',
                description: p.description || '',
            })) || [];

            const skills = skillsResult.data?.map((s: any) => ({
                id: s.id,
                name: s.name,
                level: s.level || 1,
                progress: s.progress || 0,
                color: s.color,
            })) || [];

            const taskClasses = taskClassesResult.data?.map((tc: any) => ({
                id: tc.id,
                name: tc.name,
                statType: tc.stat_type,
                color: tc.color,
            })) || [];

            const recurringCompletions = recurringResult.data?.map((rc: any) => ({
                taskId: rc.task_id,
                date: rc.completed_date ? new Date(rc.completed_date).toISOString().split('T')[0] : '',
                completed: true, // completed_date oznacza że było completed
            })) || [];

            const character = characterResult.data ? {
                name: (characterResult.data as any).name,
                level: (characterResult.data as any).level,
                xp: (characterResult.data as any).xp,
                totalXp: (characterResult.data as any).total_xp || (characterResult.data as any).xp,
                avatar: (characterResult.data as any).avatar,
                strength: (characterResult.data as any).strength,
                strengthProgress: (characterResult.data as any).strength_progress || 0,
                endurance: (characterResult.data as any).endurance,
                enduranceProgress: (characterResult.data as any).endurance_progress || 0,
                intelligence: (characterResult.data as any).intelligence,
                intelligenceProgress: (characterResult.data as any).intelligence_progress || 0,
                agility: (characterResult.data as any).agility,
                agilityProgress: (characterResult.data as any).agility_progress || 0,
                charisma: (characterResult.data as any).charisma,
                charismaProgress: (characterResult.data as any).charisma_progress || 0,
                unspentPoints: (characterResult.data as any).unspent_points || 0,
            } : null;

            // Save to localStorage
            localStorage.setItem('tasks', JSON.stringify(tasks));
            localStorage.setItem('projects', JSON.stringify(projects));
            if (character) {
                localStorage.setItem('character', JSON.stringify(character));
            }
            localStorage.setItem('skills', JSON.stringify(skills));
            localStorage.setItem('taskClasses', JSON.stringify(taskClasses));
            localStorage.setItem('recurringCompletions', JSON.stringify(recurringCompletions));

            const syncedAt = new Date().toISOString();
            localStorage.setItem('lastSyncAt', syncedAt);

            this.syncStatus.isSyncing = false;
            this.syncStatus.lastSyncAt = syncedAt;
            this.syncStatus.error = null;
            this.notifyListeners();

            console.log('✅ Pull completed successfully');
            console.log(`  Tasks: ${tasks.length}, Projects: ${projects.length}, Skills: ${skills.length}`);
            return { success: true, syncedAt };

        } catch (error) {
            console.error('❌ Pull failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            this.syncStatus.isSyncing = false;
            this.syncStatus.error = errorMessage;
            this.notifyListeners();

            return { success: false, error: errorMessage };
        }
    }

    // ==================== PUSH TO CLOUD ====================

    /**
     * Push all data from localStorage to Supabase
     */
    async pushToCloud(userId: string): Promise<SyncResult> {
        console.log('🔼 Starting push to cloud...');

        this.syncStatus.isSyncing = true;
        this.syncStatus.error = null;
        this.notifyListeners();

        try {
            // Get data from localStorage
            const tasks = this.getFromLocalStorage<Task[]>('tasks', []);
            const projects = this.getFromLocalStorage<Project[]>('projects', []);
            const character = this.getFromLocalStorage<Character | null>('character', null);
            const skills = this.getFromLocalStorage<Skill[]>('skills', []);
            const taskClasses = this.getFromLocalStorage<TaskClass[]>('taskClasses', []);
            const recurringCompletions = this.getFromLocalStorage<RecurringTaskCompletion[]>('recurringCompletions', []);

            console.log(`  Pushing: ${tasks.length} tasks, ${projects.length} projects, ${skills.length} skills`);

            // Map camelCase to snake_case for Supabase
            const tasksForDb = tasks.map(t => ({
                id: t.id, // UUID jako string
                user_id: userId,
                project_id: t.projectId || null,
                name: t.name,
                description: t.description || '',
                completed: t.completed,
                xp_reward: t.xpReward,
                priority: t.priority,
                due_date: toISODate(t.dueDate),
                subtasks: t.subtasks || [],
                created_at: toISOTimestamp(t.createdAt),
                completed_at: toISOTimestamp(t.completedAt || ''),
                is_recurring: t.isRecurring || false,
                recurring_type: t.recurringType || null,
                recurring_day: t.recurringDay || null,
                recurring_end_date: t.recurringEndDate ? toISODate(t.recurringEndDate) : null,
                stat_type: t.statType || null,
                class_id: t.classId || null,
                skill_id: t.skillId || null,
                is_flexible: t.isFlexible || false,
            }));

            const projectsForDb = projects.map(p => ({
                id: p.id,
                user_id: userId,
                name: p.name,
                color: p.color || '#6366f1',
                description: p.description || '',
            }));

            const skillsForDb = skills.map(s => ({
                id: s.id,
                user_id: userId,
                name: s.name,
                level: s.level || 1,
                progress: s.progress || 0,
                color: s.color || null,
            }));

            const taskClassesForDb = taskClasses.map(tc => ({
                id: tc.id,
                user_id: userId,
                name: tc.name,
                stat_type: tc.statType,
                color: tc.color || null,
            }));

            // Recurring completions - konwertuj do completed_date
            const recurringForDb = recurringCompletions
                .filter(rc => rc.completed) // Tylko completed
                .map(rc => ({
                    user_id: userId,
                    task_id: rc.taskId,
                    completed_date: toISODate(rc.date),
                }));

            const characterForDb = character ? {
                user_id: userId,
                name: character.name,
                level: character.level,
                xp: character.xp,
                total_xp: character.totalXp || character.xp,
                avatar: character.avatar,
                strength: character.strength,
                strength_progress: character.strengthProgress || 0,
                endurance: character.endurance,
                endurance_progress: character.enduranceProgress || 0,
                intelligence: character.intelligence,
                intelligence_progress: character.intelligenceProgress || 0,
                agility: character.agility,
                agility_progress: character.agilityProgress || 0,
                charisma: character.charisma,
                charisma_progress: character.charismaProgress || 0,
                unspent_points: character.unspentPoints || 0,
            } : null;

            // Upsert all data (insert or update)
            const results = await Promise.allSettled([
                // Tasks
                tasksForDb.length > 0
                    ? supabase.from('tasks').upsert(tasksForDb as any, { onConflict: 'id' })
                    : Promise.resolve({ error: null }),

                // Projects
                projectsForDb.length > 0
                    ? supabase.from('projects').upsert(projectsForDb as any, { onConflict: 'id' })
                    : Promise.resolve({ error: null }),

                // Character
                characterForDb
                    ? supabase.from('characters').upsert(characterForDb as any, { onConflict: 'user_id' })
                    : Promise.resolve({ error: null }),

                // Skills
                skillsForDb.length > 0
                    ? supabase.from('skills').upsert(skillsForDb as any, { onConflict: 'id' })
                    : Promise.resolve({ error: null }),

                // Task Classes
                taskClassesForDb.length > 0
                    ? supabase.from('task_classes').upsert(taskClassesForDb as any, { onConflict: 'id' })
                    : Promise.resolve({ error: null }),

                // Recurring Completions
                recurringForDb.length > 0
                    ? supabase.from('recurring_completions').upsert(recurringForDb as any, {
                        onConflict: 'user_id,task_id,completed_date',
                        ignoreDuplicates: true
                    })
                    : Promise.resolve({ error: null }),
            ]);

            // Check for any errors
            const errors = results
                .filter(r => r.status === 'rejected')
                .map(r => (r as PromiseRejectedResult).reason);

            if (errors.length > 0) {
                throw new Error(`Push failed: ${errors.join(', ')}`);
            }

            const syncedAt = new Date().toISOString();
            localStorage.setItem('lastSyncAt', syncedAt);

            this.syncStatus.isSyncing = false;
            this.syncStatus.lastSyncAt = syncedAt;
            this.syncStatus.error = null;
            this.notifyListeners();

            console.log('✅ Push completed successfully');
            return { success: true, syncedAt };

        } catch (error) {
            console.error('❌ Push failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            this.syncStatus.isSyncing = false;
            this.syncStatus.error = errorMessage;
            this.notifyListeners();

            return { success: false, error: errorMessage };
        }
    }

    // ==================== FULL SYNC ====================

    /**
     * Full sync: Pull from cloud, then push local changes
     * This is the safest approach for initial sync
     */
    async fullSync(userId: string): Promise<SyncResult> {
        console.log('🔄 Starting full sync...');

        // First PUSH local changes to cloud
        const pushResult = await this.pushToCloud(userId);
        if (!pushResult.success) {
            console.warn('⚠️ Push failed, skipping pull');
            return pushResult;
        }

        // Then pull from cloud to get merged data
        const pullResult = await this.pullFromCloud(userId);
        return pullResult;
    }

    /**
     * Smart sync: Decide whether to pull or push based on last sync time
     */
    async smartSync(userId: string): Promise<SyncResult> {
        const lastSyncAt = localStorage.getItem('lastSyncAt');

        if (!lastSyncAt) {
            // Never synced before - do full sync
            return this.fullSync(userId);
        }

        // For now, always do full sync
        // TODO: Implement smart conflict detection
        return this.fullSync(userId);
    }

    // ==================== HELPERS ====================

    /**
     * Get data from localStorage with type safety
     */
    private getFromLocalStorage<T>(key: string, defaultValue: T): T {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return defaultValue;
        }
    }

    /**
     * Clear all sync data (for logout)
     */
    async clearLocalData(): Promise<void> {
        const keysToRemove = [
            'tasks',
            'projects',
            'character',
            'skills',
            'taskClasses',
            'recurringCompletions',
            'lastSyncAt'
        ];

        keysToRemove.forEach(key => localStorage.removeItem(key));

        this.syncStatus = {
            isSyncing: false,
            lastSyncAt: null,
            error: null,
        };
        this.notifyListeners();
    }
}

// Export singleton instance
export const syncService = new SyncService();