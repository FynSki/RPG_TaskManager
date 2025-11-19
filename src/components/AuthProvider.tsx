/**
 * Auth Provider - Authentication Context
 * 
 * Provides authentication state and functions throughout the app.
 * Manages user session, login, logout, and registration.
 * 
 * KOMPATYBILNA WERSJA - dzia³a ze starszymi wersjami @supabase/supabase-js
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// U¿ywamy w³asnych typów zamiast importowaæ z @supabase/supabase-js
type AuthError = {
    message: string;
    status?: number;
};

// Auth Context Type
interface AuthContextType {
    user: any;
    session: any;
    loading: boolean;
    isPremium: boolean;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    refreshPremiumStatus: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false);

    // Check Premium Status
    async function checkPremiumStatus(userId: string) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('is_premium, premium_expires_at')
                .eq('id', userId)
                .single();

            if (error) throw error;

            if (data) {
                // Check if premium and not expired
                const isActive = data.is_premium && (
                    !data.premium_expires_at ||
                    new Date(data.premium_expires_at) > new Date()
                );
                setIsPremium(isActive);
            }
        } catch (error) {
            console.error('Error checking premium status:', error);
            setIsPremium(false);
        }
    }

    // Refresh Premium Status (can be called manually)
    async function refreshPremiumStatus() {
        if (user) {
            await checkPremiumStatus(user.id);
        }
    }

    // Initialize auth state
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                checkPremiumStatus(session.user.id);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                checkPremiumStatus(session.user.id);
            } else {
                setIsPremium(false);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Sign In
    async function signIn(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error: error as AuthError | null };
    }

    // Sign Up
    async function signUp(email: string, password: string) {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        return { error: error as AuthError | null };
    }

    // Sign Out
    async function signOut() {
        await supabase.auth.signOut();
    }

    const value = {
        user,
        session,
        loading,
        isPremium,
        signIn,
        signUp,
        signOut,
        refreshPremiumStatus,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom Hook to use Auth Context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}