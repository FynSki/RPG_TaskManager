/**
 * NotificationSettingsPanel — panel ustawień powiadomień w SettingsView
 * Na web pokazuje info że powiadomienia są w wersji mobilnej
 */

import { useState, useEffect } from 'react';
import {
    requestNotificationPermission,
    checkNotificationPermission,
    scheduleAllNotifications,
    cancelAllNotifications,
    DEFAULT_NOTIFICATION_SETTINGS,
    type NotificationSettings,
} from '../services/NotificationService';
import { useAppContext } from '../refactored-src/context/AppContext';
import { usePersistedState } from '../refactored-src/utils';

function isNative(): boolean {
    return (
        typeof window !== 'undefined' &&
        (window as any).Capacitor?.isNativePlatform?.() === true
    );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-indigo-600' : 'bg-slate-600'
                }`}
        >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
        </button>
    );
}

function TimeInput({
    label,
    hour,
    minute,
    onChange,
}: {
    label: string;
    hour: number;
    minute: number;
    onChange: (h: number, m: number) => void;
}) {
    const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    return (
        <div className="mt-3">
            <label className="block text-xs text-slate-400 mb-1">{label}</label>
            <input
                type="time"
                value={value}
                onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    onChange(h, m);
                }}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm"
            />
        </div>
    );
}

export function NotificationSettingsPanel() {
    const { tasks, recurringCompletions } = useAppContext();
    const [settings, setSettings] = usePersistedState<NotificationSettings>(
        'notificationSettings',
        DEFAULT_NOTIFICATION_SETTINGS
    );
    const [hasPermission, setHasPermission] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);

    useEffect(() => {
        if (isNative()) {
            checkNotificationPermission().then(setHasPermission);
        }
    }, []);

    async function handleToggleEnabled(enabled: boolean) {
        const updated = { ...settings, enabled };
        setSettings(updated);
        if (!enabled) {
            await cancelAllNotifications();
        } else if (hasPermission) {
            await scheduleAllNotifications(tasks, recurringCompletions, updated);
        }
    }

    async function handleChange(patch: Partial<NotificationSettings>) {
        const updated = { ...settings, ...patch };
        setSettings(updated);
        if (updated.enabled && hasPermission) {
            await scheduleAllNotifications(tasks, recurringCompletions, updated);
        }
    }

    async function handleRequestPermission() {
        setIsRequesting(true);
        const granted = await requestNotificationPermission();
        setHasPermission(granted);
        setIsRequesting(false);
        if (granted && settings.enabled) {
            await scheduleAllNotifications(tasks, recurringCompletions, settings);
        }
    }

    // Na web — info o wersji mobilnej
    if (!isNative()) {
        return (
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-3">🔔 Notifications</h3>
                <div className="flex items-start gap-3 p-4 bg-indigo-900/20 border border-indigo-700/50 rounded-lg">
                    <span className="text-2xl flex-shrink-0">📱</span>
                    <div>
                        <p className="text-slate-300 text-sm font-medium mb-1">Available in the mobile app</p>
                        <p className="text-slate-400 text-xs">
                            Push notifications for daily quests and backlog reminders are available
                            in the Android version of RPG Planner.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold">🔔 Notifications</h3>
                <Toggle
                    enabled={settings.enabled}
                    onToggle={() => handleToggleEnabled(!settings.enabled)}
                />
            </div>

            {/* Brak uprawnień */}
            {!hasPermission && (
                <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                    <p className="text-yellow-300 text-sm mb-3">
                        ⚠️ Notification permission required
                    </p>
                    <button
                        onClick={handleRequestPermission}
                        disabled={isRequesting}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg transition disabled:opacity-50"
                    >
                        {isRequesting ? 'Requesting...' : 'Allow Notifications'}
                    </button>
                </div>
            )}

            <div className={`space-y-4 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Poranne */}
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">☀️ Morning reminder</p>
                            <p className="text-xs text-slate-400 mt-0.5">Daily quests for today</p>
                        </div>
                        <Toggle
                            enabled={settings.morningEnabled}
                            onToggle={() => handleChange({ morningEnabled: !settings.morningEnabled })}
                        />
                    </div>
                    {settings.morningEnabled && (
                        <TimeInput
                            label="Notification time"
                            hour={settings.morningHour}
                            minute={settings.morningMinute}
                            onChange={(h, m) => handleChange({ morningHour: h, morningMinute: m })}
                        />
                    )}
                </div>

                {/* Backlog */}
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">⏰ Backlog reminder</p>
                            <p className="text-xs text-slate-400 mt-0.5">Overdue quests alert</p>
                        </div>
                        <Toggle
                            enabled={settings.backlogEnabled}
                            onToggle={() => handleChange({ backlogEnabled: !settings.backlogEnabled })}
                        />
                    </div>
                    {settings.backlogEnabled && (
                        <TimeInput
                            label="Notification time"
                            hour={settings.backlogHour}
                            minute={settings.backlogMinute}
                            onChange={(h, m) => handleChange({ backlogHour: h, backlogMinute: m })}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}