/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client using environment variables.
 * The client is used throughout the app for authentication and database operations.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabaseTypes';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. ' +
        'Please check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local'
    );
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Store session in localStorage (survives page refresh)
        storage: window.localStorage,
        // Automatically refresh tokens
        autoRefreshToken: true,
        // Persist session across page reloads
        persistSession: true,
        // Detect session from URL (for magic links, etc.)
        detectSessionInUrl: true
    }
});

// Helper function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
}

// Helper function to get current user
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Helper function to sign out
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}

// Export types for convenience
export type { Database } from './supabaseTypes';
