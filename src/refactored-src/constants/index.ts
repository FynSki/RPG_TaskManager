/**
 * Constants and configuration for TaskQuest application
 */

export const AVATARS = ["⚔️", "🛡️", "🏹", "📚", "🧙", "🧠", "🧘"];

export const STAT_DESCRIPTIONS = {
    strength: "Strength represents physical power and toughness. Complete tasks related to physical activities, workouts, or demanding physical work to level up.",
    endurance: "Endurance shows your stamina and persistence. Tasks requiring long-term effort, consistency, or physical stamina will improve this stat.",
    intelligence: "Intelligence reflects mental capacity and learning. Complete tasks involving study, problem-solving, research, or creative thinking to grow.",
    agility: "Agility represents speed, reflexes, and adaptability. Quick tasks, time-sensitive challenges, or activities requiring coordination boost this stat.",
    charisma: "Charisma shows your social skills and influence. Tasks involving communication, networking, presentations, or helping others will enhance this stat."
};

export const STAT_CONFIG = [
    { name: "Strength", key: "strength", icon: "💪" },
    { name: "Endurance", key: "endurance", icon: "🏃" },
    { name: "Intelligence", key: "intelligence", icon: "🧠" },
    { name: "Agility", key: "agility", icon: "⚡" },
    { name: "Charisma", key: "charisma", icon: "✨" },
] as const;

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_NAMES_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const DEFAULT_CHARACTER = {
    name: "Adventurer",
    level: 1,
    xp: 0,
    totalXp: 0,
    avatar: "⚔️",
    strength: 1,
    strengthProgress: 0,
    endurance: 1,
    enduranceProgress: 0,
    intelligence: 1,
    intelligenceProgress: 0,
    agility: 1,
    agilityProgress: 0,
    charisma: 1,
    charismaProgress: 0,
    unspentPoints: 0,
};
