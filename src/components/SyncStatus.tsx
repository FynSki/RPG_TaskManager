/**
 * SyncStatus Component
 * 
 * Displays sync status and provides manual sync button
 * Shows: syncing indicator, last sync time, error messages
 */

import { useSync } from '../hooks/useSync';
import { useAuth } from './AuthProvider';

export function SyncStatus() {
    const { user } = useAuth();
    const { sync, isSyncing, lastSyncAt, error, isPremium } = useSync();

    // Don't show if not logged in
    if (!user) {
        return null;
    }

    // ⭐ NOWE: Free users see upgrade message
    if (!isPremium) {
        return (
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-4 border border-yellow-500">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🔒</span>
                    <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm">
                            Cloud Sync - Premium Feature
                        </h4>
                        <p className="text-xs text-yellow-100 mt-1">
                            Upgrade to sync your data across all devices
                        </p>
                    </div>
                </div>
                <button
                    className="mt-3 w-full px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-yellow-50 transition text-sm"
                    onClick={() => {
                        // TODO: Link do premium upgrade
                        alert('Premium upgrade coming soon!');
                    }}
                >
                    ✨ Upgrade to Premium
                </button>
            </div>
        );
    }


    const handleSync = async () => {
        const result = await sync();
        if (result.success) {
            console.log('✅ Sync successful');
        } else {
            console.error('❌ Sync failed:', result.error);
        }
    };

    const formatLastSync = (timestamp: string | null) => {
        if (!timestamp) return 'Never';

        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
            {/* Premium badge */}
            <span className="text-xs bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-2 py-1 rounded-full font-semibold">
                💎 PREMIUM
            </span>
            {/* Status Indicator */}
            <div className="flex items-center gap-2">
                {isSyncing ? (
                    <>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        <span className="text-sm text-slate-300">Syncing...</span>
                    </>
                ) : error ? (
                    <>
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-sm text-red-400">Sync error</span>
                    </>
                ) : (
                    <>
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm text-slate-300">
                            {formatLastSync(lastSyncAt)}
                        </span>
                    </>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <span className="text-xs text-red-400 max-w-xs truncate" title={error}>
                    {error}
                </span>
            )}

            {/* Sync Button */}
            <button
                onClick={handleSync}
                disabled={isSyncing}
                className="ml-auto px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded transition"
                title="Sync now"
            >
                {isSyncing ? (
                    <span className="flex items-center gap-1">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Syncing
                    </span>
                ) : (
                    <span className="flex items-center gap-1">
                        🔄 Sync
                    </span>
                )}
            </button>
        </div>
    );
}