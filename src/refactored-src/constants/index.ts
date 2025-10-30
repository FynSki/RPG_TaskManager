import type { Character, StatType } from '../types';

/**
 * Available avatar emojis for character customization
 */
export const AVATARS = [
    "🧙", "⚔️", "🏹", "🛡️", "🗡️",
    "🧙‍♀️", "🧙‍♂️", "🧝‍♀️", "🧝‍♂️", "🧛",
    "🧛‍♀️", "🧚", "🧚‍♀️", "🧚‍♂️", "👑",
    "🦸", "🦸‍♀️", "🦸‍♂️", "🦹", "🦹‍♀️"
];

/**
 * Descriptions for each RPG stat
 */
export const STAT_DESCRIPTIONS: Record<StatType, string> = {
    strength: "Physical power and combat ability. Increases when you complete challenging physical tasks, difficult projects, or high-priority missions.",
    endurance: "Stamina and persistence. Grows when you complete recurring tasks, maintain streaks, or finish long-term projects.",
    intelligence: "Mental acuity and problem-solving. Develops through learning tasks, research, strategic planning, and knowledge-based activities.",
    agility: "Speed and adaptability. Improves when you complete tasks quickly, handle multiple projects, or adapt to changing priorities.",
    charisma: "Social skills and influence. Increases through communication tasks, team projects, presentations, and relationship-building activities."
};

/**
 * Default character state for new users
 */
export const DEFAULT_CHARACTER: Character = {
    name: "Hero",
    level: 1,
    xp: 0,
    totalXp: 0,
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
