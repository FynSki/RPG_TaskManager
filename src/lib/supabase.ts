/**
 * Supabase Client Configuration
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabaseTypes';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables.');
}

// Fix: define storage once and cast to any so TS does not break Database types
const browserStorage = typeof window !== "undefined"
  ? window.localStorage
  : undefined;

// Fix: use browserStorage variable so TS doesn’t mark it as unused
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: browserStorage as any, // <-- KLUCZOWE!
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export type { Database } from './supabaseTypes';
