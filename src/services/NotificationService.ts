/**
 * NotificationService — lokalne powiadomienia push
 * Używa @capacitor/local-notifications
 * Na web gracefully degraduje (nic nie robi)
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import type { Task, RecurringTaskCompletion } from '../refactored-src/types';
import { getToday, getTasksForDate, isTaskCompletedOnDate } from '../refactored-src/utils';

// ─── Typy ─────────────────────────────────────────────────────────────────────

export type NotificationSettings = {
    enabled: boolean;
    morningEnabled: boolean;
    morningHour: number;
    morningMinute: number;
    backlogEnabled: boolean;
    backlogHour: number;
    backlogMinute: number;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    enabled: true,
    morningEnabled: true,
    morningHour: 8,
    morningMinute: 0,
    backlogEnabled: true,
    backlogHour: 20,
    backlogMinute: 0,
};

const NOTIFICATION_IDS = {
    MORNING: 1001,
    BACKLOG: 1002,
} as const;

// ─── Utils ────────────────────────────────────────────────────────────────────

function isNative(): boolean {
    return (
        typeof window !== 'undefined' &&
        (window as any).Capacitor?.isNativePlatform?.() === true
    );
}

// ─── Uprawnienia ──────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
    if (!isNative()) return false;
    try {
        const { display } = await LocalNotifications.requestPermissions();
        return display === 'granted';
    } catch {
        return false;
    }
}

export async function checkNotificationPermission(): Promise<boolean> {
    if (!isNative()) return false;
    try {
        const { display } = await LocalNotifications.checkPermissions();
        return display === 'granted';
    } catch {
        return false;
    }
}

// ─── Planowanie ───────────────────────────────────────────────────────────────

export async function scheduleMorningNotification(
    tasks: Task[],
    recurringCompletions: RecurringTaskCompletion[],
    settings: NotificationSettings
): Promise<void> {
    if (!isNative() || !settings.enabled || !settings.morningEnabled) return;

    const today = getToday();
    const todayTasks = getTasksForDate(tasks, today);
    const activeTasks = todayTasks.filter(t =>
        t.isRecurring
            ? !isTaskCompletedOnDate(t, today, recurringCompletions)
            : !t.completed
    );

    await cancelNotification(NOTIFICATION_IDS.MORNING);
    if (activeTasks.length === 0) return;

    const scheduledTime = new Date();
    scheduledTime.setHours(settings.morningHour, settings.morningMinute, 0, 0);
    if (scheduledTime <= new Date()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const count = activeTasks.length;
    try {
        await LocalNotifications.schedule({
            notifications: [{
                id: NOTIFICATION_IDS.MORNING,
                title: '⚔️ Daily Quests Await!',
                body: `You have ${count} quest${count !== 1 ? 's' : ''} to complete today. Time to level up!`,
                schedule: { at: scheduledTime },
                smallIcon: 'ic_stat_icon_config_sample',
                actionTypeId: '',
                extra: { type: 'morning' },
            }],
        });
    } catch (e) {
        console.warn('Morning notification failed:', e);
    }
}

export async function scheduleBacklogNotification(
    tasks: Task[],
    settings: NotificationSettings
): Promise<void> {
    if (!isNative() || !settings.enabled || !settings.backlogEnabled) return;

    const today = getToday();
    const backlogTasks = tasks.filter(
        t => !t.completed && t.dueDate && t.dueDate < today && !t.isRecurring
    );

    await cancelNotification(NOTIFICATION_IDS.BACKLOG);
    if (backlogTasks.length === 0) return;

    const scheduledTime = new Date();
    scheduledTime.setHours(settings.backlogHour, settings.backlogMinute, 0, 0);
    if (scheduledTime <= new Date()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const count = backlogTasks.length;
    try {
        await LocalNotifications.schedule({
            notifications: [{
                id: NOTIFICATION_IDS.BACKLOG,
                title: '⏰ Overdue Quests!',
                body: `${count} overdue quest${count !== 1 ? 's' : ''} waiting in your backlog!`,
                schedule: { at: scheduledTime },
                smallIcon: 'ic_stat_icon_config_sample',
                actionTypeId: '',
                extra: { type: 'backlog' },
            }],
        });
    } catch (e) {
        console.warn('Backlog notification failed:', e);
    }
}

export async function scheduleAllNotifications(
    tasks: Task[],
    recurringCompletions: RecurringTaskCompletion[],
    settings: NotificationSettings
): Promise<void> {
    if (!isNative()) return;
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) return;

    await Promise.all([
        scheduleMorningNotification(tasks, recurringCompletions, settings),
        scheduleBacklogNotification(tasks, settings),
    ]);
}

export async function cancelNotification(id: number): Promise<void> {
    if (!isNative()) return;
    try {
        await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch { }
}

export async function cancelAllNotifications(): Promise<void> {
    if (!isNative()) return;
    try {
        await LocalNotifications.cancel({
            notifications: Object.values(NOTIFICATION_IDS).map(id => ({ id })),
        });
    } catch { }
}