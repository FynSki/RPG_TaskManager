/**
 * useSync Hook
 * 
 * React hook for managing Supabase synchronization
 * 
 * Usage:
 * const { sync, status, lastSyncAt, isSyncing, error } = useSync();
 * 
 * // Manual sync
 * await sync();
 * 
 * // Auto-sync on login
 * useEffect(() => {
 *   if (user) {
 *     sync();
 *   }
 * }, [user]);
 */

import { useState, useEffect, useCallback } from 'react';
import { syncService, type SyncStatus } from '../services/syncService';
import { useAuth } from '../components/AuthProvider';

export function useSync() {
    const { user, isPremium } = useAuth();  // ← Dodaj isPremium
    const [status, setStatus] = useState<SyncStatus>(syncService.getStatus());

    // Subscribe to sync status changes
    useEffect(() => {
        const unsubscribe = syncService.onStatusChange(setStatus);
        return unsubscribe;
    }, []);

    /**
     * Trigger full sync
     */
    const sync = useCallback(async () => {
        if (!user) {
            console.warn('Cannot sync: user not logged in');
            return { success: false, error: 'User not logged in' };
        }

        // ⭐ NOWE: Check premium
        if (!isPremium) {
            console.warn('🔒 Sync requires Premium subscription');
            return { success: false, error: 'Premium subscription required' };
        }

        return await syncService.fullSync(user.id);
    }, [user, isPremium]);

    /**
     * Pull only (download from cloud)
     */
    const pullFromCloud = useCallback(async () => {
        if (!user) {
            return { success: false, error: 'User not logged in' };
        }

        return await syncService.pullFromCloud(user.id);
    }, [user]);

    /**
     * Push only (upload to cloud)
     */
    const pushToCloud = useCallback(async () => {
        if (!user) {
            return { success: false, error: 'User not logged in' };
        }

        return await syncService.pushToCloud(user.id);
    }, [user]);

    /**
     * Smart sync (auto-detect what to do)
     */
    const smartSync = useCallback(async () => {
        if (!user) {
            return { success: false, error: 'User not logged in' };
        }

        return await syncService.smartSync(user.id);
    }, [user]);

    /**
     * Clear local data (for logout)
     */
    const clearLocalData = useCallback(async () => {
        return await syncService.clearLocalData();
    }, []);

    return {
        // Actions
        sync,
        pullFromCloud,
        pushToCloud,
        smartSync,
        clearLocalData,

        // Status
        isSyncing: status.isSyncing,
        lastSyncAt: status.lastSyncAt,
        error: status.error,
        status,
        isPremium,
    };
}