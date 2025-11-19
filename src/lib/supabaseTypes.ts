/**
 * Supabase Database Types
 * 
 * Auto-generated types for type-safe database operations.
 * These match the schema we created in Supabase.
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    created_at: string
                    updated_at: string
                    is_premium: boolean
                    premium_expires_at: string | null
                    stripe_customer_id: string | null
                    last_sync_at: string | null
                    sync_enabled: boolean
                }
                Insert: {
                    id: string
                    email?: string | null
                    created_at?: string
                    updated_at?: string
                    is_premium?: boolean
                    premium_expires_at?: string | null
                    stripe_customer_id?: string | null
                    last_sync_at?: string | null
                    sync_enabled?: boolean
                }
                Update: {
                    id?: string
                    email?: string | null
                    created_at?: string
                    updated_at?: string
                    is_premium?: boolean
                    premium_expires_at?: string | null
                    stripe_customer_id?: string | null
                    last_sync_at?: string | null
                    sync_enabled?: boolean
                }
            }
            characters: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string
                    updated_at: string
                    name: string
                    avatar: string
                    level: number
                    xp: number
                    strength: number
                    endurance: number
                    intelligence: number
                    agility: number
                    charisma: number
                    is_active: boolean
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string
                    updated_at?: string
                    name?: string
                    avatar?: string
                    level?: number
                    xp?: number
                    strength?: number
                    endurance?: number
                    intelligence?: number
                    agility?: number
                    charisma?: number
                    is_active?: boolean
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string
                    updated_at?: string
                    name?: string
                    avatar?: string
                    level?: number
                    xp?: number
                    strength?: number
                    endurance?: number
                    intelligence?: number
                    agility?: number
                    charisma?: number
                    is_active?: boolean
                }
            }
            tasks: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string
                    updated_at: string
                    name: string
                    description: string | null
                    completed: boolean
                    completed_at: string | null
                    due_date: string | null
                    priority: string
                    xp_reward: number
                    project_id: string | null
                    class_id: string | null
                    skill_id: string | null
                    is_recurring: boolean
                    recurring_type: string | null
                    recurring_day: number | null
                    recurring_end_date: string | null
                    is_flexible: boolean
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string
                    updated_at?: string
                    name: string
                    description?: string | null
                    completed?: boolean
                    completed_at?: string | null
                    due_date?: string | null
                    priority?: string
                    xp_reward?: number
                    project_id?: string | null
                    class_id?: string | null
                    skill_id?: string | null
                    is_recurring?: boolean
                    recurring_type?: string | null
                    recurring_day?: number | null
                    recurring_end_date?: string | null
                    is_flexible?: boolean
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string
                    updated_at?: string
                    name?: string
                    description?: string | null
                    completed?: boolean
                    completed_at?: string | null
                    due_date?: string | null
                    priority?: string
                    xp_reward?: number
                    project_id?: string | null
                    class_id?: string | null
                    skill_id?: string | null
                    is_recurring?: boolean
                    recurring_type?: string | null
                    recurring_day?: number | null
                    recurring_end_date?: string | null
                    is_flexible?: boolean
                }
            }
            projects: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string
                    updated_at: string
                    name: string
                    description: string | null
                    color: string | null
                    is_active: boolean
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string
                    updated_at?: string
                    name: string
                    description?: string | null
                    color?: string | null
                    is_active?: boolean
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string
                    updated_at?: string
                    name?: string
                    description?: string | null
                    color?: string | null
                    is_active?: boolean
                }
            }
            task_classes: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string
                    updated_at: string
                    name: string
                    stat_type: string
                    is_active: boolean
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string
                    updated_at?: string
                    name: string
                    stat_type: string
                    is_active?: boolean
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string
                    updated_at?: string
                    name?: string
                    stat_type?: string
                    is_active?: boolean
                }
            }
            skills: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string
                    updated_at: string
                    name: string
                    is_active: boolean
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string
                    updated_at?: string
                    name: string
                    is_active?: boolean
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string
                    updated_at?: string
                    name?: string
                    is_active?: boolean
                }
            }
            recurring_completions: {
                Row: {
                    id: string
                    user_id: string
                    task_id: string
                    completed_date: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    task_id: string
                    completed_date: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    task_id?: string
                    completed_date?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}