import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeAdMob, showBanner } from './services/AdService'
import {
    scheduleAllNotifications,
    checkNotificationPermission,
    requestNotificationPermission,
    DEFAULT_NOTIFICATION_SETTINGS,
    type NotificationSettings
} from './services/NotificationService'

const isNative = typeof window !== 'undefined' &&
    (window as any).Capacitor?.isNativePlatform?.() === true;

// Flaga premium — ustawiana przez Vite przy buildzie
const isPremium = __IS_PREMIUM__;

function getStoredData() {
    try {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const recurringCompletions = JSON.parse(localStorage.getItem('recurringCompletions') || '[]');
        const settings: NotificationSettings = JSON.parse(
            localStorage.getItem('notificationSettings') ||
            JSON.stringify(DEFAULT_NOTIFICATION_SETTINGS)
        );
        return { tasks, recurringCompletions, settings };
    } catch {
        return { tasks: [], recurringCompletions: [], settings: DEFAULT_NOTIFICATION_SETTINGS };
    }
}

async function refreshNotifications() {
    if (!isNative) return;
    const { tasks, recurringCompletions, settings } = getStoredData();
    await scheduleAllNotifications(tasks, recurringCompletions, settings);
}

async function initApp() {
    if (!isNative) return;

    // Reklamy tylko w wersji Free
    if (!isPremium) {
        await initializeAdMob();
        setTimeout(() => showBanner(), 1000);
    }

    // Powiadomienia — obie wersje
    const hasAskedBefore = localStorage.getItem('notificationPermissionAsked');
    if (!hasAskedBefore) {
        setTimeout(async () => {
            const hasPermission = await checkNotificationPermission();
            if (!hasPermission) {
                await requestNotificationPermission();
            }
            localStorage.setItem('notificationPermissionAsked', 'true');
            await refreshNotifications();
        }, 2000);
    } else {
        await refreshNotifications();
    }

    // Odœwie¿ harmonogram gdy aplikacja wraca z t³a
    try {
        const { App: CapApp } = await import('@capacitor/app');
        CapApp.addListener('appStateChange', async ({ isActive }) => {
            if (isActive) {
                await refreshNotifications();
            }
        });
    } catch (e) {
        console.warn('App state listener failed:', e);
    }
}

initApp();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)