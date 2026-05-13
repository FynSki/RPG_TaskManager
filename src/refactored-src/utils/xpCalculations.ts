/**
 * XP, Gold and character progression utility functions
 */

import type { Character, Task, TaskClass, Skill, StatType } from '../types';
import { RARITY_XP, RARITY_GOLD } from '../constants';

export function calculateXpForLevel(level: number): number {
    return Math.floor(250 * level * (level + 1));
}

export function getRarityXP(rarity: string): number {
    return RARITY_XP[rarity] ?? 50;
}

export function getRarityGold(rarity: string): number {
    return RARITY_GOLD[rarity] ?? 5;
}

/**
 * Award XP and Gold to character, level up if necessary.
 */
export function awardXP(
    character: Character,
    xp: number,
    gold: number,
    task: Task,
    taskClasses: TaskClass[],
    skills: Skill[]
): { character: Character; taskClasses: TaskClass[]; skills: Skill[] } {
    let newChar = { ...character };

    // XP & level up
    newChar.xp += xp;
    newChar.totalXp += xp;
    while (newChar.xp >= calculateXpForLevel(newChar.level)) {
        newChar.xp -= calculateXpForLevel(newChar.level);
        newChar.level++;
        newChar.unspentPoints++;
    }

    // Gold
    newChar.gold = (newChar.gold ?? 0) + gold;
    newChar.totalGold = (newChar.totalGold ?? 0) + gold;

    // Stat progress via task class
    if (task.classId) {
        const taskClass = taskClasses.find(c => c.id === task.classId);
        if (taskClass) {
            const statKey = taskClass.statType as StatType;
            const progressKey = `${statKey}Progress` as keyof Character;
            const statValue = newChar[statKey] as number;
            const newProgress = (newChar[progressKey] as number) + 1;
            if (newProgress >= statValue + 1) {
                (newChar[statKey] as any) = statValue + 1;
                (newChar[progressKey] as any) = 0;
            } else {
                (newChar[progressKey] as any) = newProgress;
            }
        }
    }

    // Skill progress
    let updatedSkills = [...skills];
    if (task.skillId) {
        updatedSkills = skills.map(s => {
            if (s.id !== task.skillId) return s;
            const newProgress = s.progress + 1;
            return newProgress >= s.level + 1
                ? { ...s, level: s.level + 1, progress: 0 }
                : { ...s, progress: newProgress };
        });
    }

    return { character: newChar, taskClasses, skills: updatedSkills };
}

export function spendStatPoint(character: Character, stat: StatType): Character {
    if (character.unspentPoints <= 0) return character;
    return {
        ...character,
        unspentPoints: character.unspentPoints - 1,
        [stat]: (character[stat] as number) + 1,
    };
}

/**
 * Odejmij gold od postaci. Zwraca null jeœli brak œrodków.
 */
export function spendGold(character: Character, amount: number): Character | null {
    if ((character.gold ?? 0) < amount) return null;
    return { ...character, gold: character.gold - amount };
}

export function getStatProgressPercentage(progress: number, level: number): number {
    return Math.round((progress / (level + 1)) * 100);
}