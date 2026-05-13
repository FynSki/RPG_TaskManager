import type { Character, StatType } from '../types';

export const AVATARS = [
    "🧙", "⚔️", "🏹", "🛡️", "🗡️",
    "🧙‍♀️", "🧙‍♂️", "🧝‍♀️", "🧝‍♂️", "🧛",
    "🧛‍♀️", "🧚", "🧚‍♀️", "🧚‍♂️", "👑",
    "🦸", "🦸‍♀️", "🦸‍♂️", "🦹", "🦹‍♀️"
];

export const STAT_DESCRIPTIONS: Record<StatType, string> = {
    strength: "Physical power and combat ability. Increases when you complete challenging physical tasks, difficult projects, or high-priority missions.",
    endurance: "Stamina and persistence. Grows when you complete recurring tasks, maintain streaks, or finish long-term projects.",
    intelligence: "Mental acuity and problem-solving. Develops through learning tasks, research, strategic planning, and knowledge-based activities.",
    agility: "Speed and adaptability. Improves when you complete tasks quickly, handle multiple projects, or adapt to changing priorities.",
    charisma: "Social skills and influence. Increases through communication tasks, team projects, presentations, and relationship-building activities.",
};

/** XP reward per rarity */
export const RARITY_XP: Record<string, number> = {
    common: 50,
    rare: 100,
    epic: 250,
    legendary: 500,
    unique: 1000,
};

/** Gold reward per rarity */
export const RARITY_GOLD: Record<string, number> = {
    common: 5,
    rare: 10,
    epic: 25,
    legendary: 50,
    unique: 100,
};

/**
 * Rosnący koszt odblokowania kolejnego slotu Skill lub TaskClass.
 * slot 1 — darmowy
 * slot 2 — 50 🪙
 * slot 3 — 150 🪙
 * slot 4 — 300 🪙
 * slot 5 — 500 🪙
 * slot 6+ — 750 🪙 (cap)
 */
export const UNLOCK_COSTS = [50, 150, 300, 500, 750] as const;

/**
 * Zwraca koszt odblokowania kolejnego slotu.
 * @param currentCount - ile już posiada (1 = ma 1 darmowy, chce kupić 2.)
 */
export function getUnlockCost(currentCount: number): number {
    const index = currentCount - 1;
    if (index < 0) return 0;
    return UNLOCK_COSTS[Math.min(index, UNLOCK_COSTS.length - 1)];
}

export const DEFAULT_CHARACTER: Character = {
    name: "Hero",
    level: 1,
    xp: 0,
    totalXp: 0,
    gold: 0,
    totalGold: 0,
    avatar: "🧙",
    strength: 0,
    strengthProgress: 0,
    endurance: 0,
    enduranceProgress: 0,
    intelligence: 0,
    intelligenceProgress: 0,
    agility: 0,
    agilityProgress: 0,
    charisma: 0,
    charismaProgress: 0,
    unspentPoints: 0,
};