/**
 * Custom hook for persisting state to localStorage
 */

import { useState, useEffect } from 'react';

/**
 * Hook that persists state to localStorage
 * @param key - localStorage key
 * @param defaultValue - Default value if nothing in localStorage
 * @returns Tuple of [state, setState]
 */
export function usePersistedState<T>(
    key: string,
    defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
    const [state, setState] = useState<T>(() => {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch {
            // ignore storage errors
        }
    }, [key, state]);

    return [state, setState];
}
