/**
 * XP and character progression utility functions
 */

import type { Character, Task, TaskClass, Skill, StatType } from '../types';

/**
 * Calculate XP required for a given level
 * @param level - Character level
 * @returns XP required to reach next level
 */
export function calculateXpForLevel(level: number): number {
    return Math.floor(250 * level * (level + 1));
}

/**
 * Award XP to character and level up if necessary
 * @param character - Current character state
 * @param xp - XP amount to award
 * @param task - Task that was completed
 * @param taskClasses - Array of task classes
 * @param skills - Array of skills
 * @returns Updated character, task classes, and skills
 */
export function awardXP(
    character: Character,
    xp: number,
    task: Task,
    taskClasses: TaskClass[],
    skills: Skill[]
): { character: Character; taskClasses: TaskClass[]; skills: Skill[] } {
    let newChar = { ...character };
    newChar.xp += xp;
    newChar.totalXp += xp;

    // Level up character if enough XP
    while (newChar.xp >= calculateXpForLevel(newChar.level)) {
        newChar.xp -= calculateXpForLevel(newChar.level);
        newChar.level++;
        newChar.unspentPoints++;
    }

    // Progress task class stat if task has a class
    if (task.classId) {
        const taskClass = taskClasses.find(c => c.id === task.classId);
        if (taskClass) {
            const statKey = taskClass.statType;
            const progressKey = `${statKey}Progress` as keyof Character;
            const statValue = newChar[statKey] as number;
            const progressValue = (newChar[progressKey] as number) + 1;

            if (progressValue >= statValue + 1) {
                // Level up stat
                const updatedChar = { ...newChar };
                (updatedChar[statKey] as any) = statValue + 1;
                (updatedChar[progressKey] as any) = 0;
                newChar = updatedChar;
            } else {
                // Progress stat
                const updatedChar = { ...newChar };
                (updatedChar[progressKey] as any) = progressValue;
                newChar = updatedChar;
            }
        }
    }

    // Progress skill if task has a skill
    let updatedSkills = [...skills];
    if (task.skillId) {
        updatedSkills = skills.map(s => {
            if (s.id === task.skillId) {
                const newProgress = s.progress + 1;
                if (newProgress >= s.level + 1) {
                    return { ...s, level: s.level + 1, progress: 0 };
                }
                return { ...s, progress: newProgress };
            }
            return s;
        });
    }

    return {
        character: newChar,
        taskClasses,
        skills: updatedSkills
    };
}

/**
 * Spend a stat point on a specific stat
 * @param character - Current character state
 * @param stat - Stat to increase
 * @returns Updated character
 */
export function spendStatPoint(character: Character, stat: StatType): Character {
    if (character.unspentPoints <= 0) return character;

    const newChar = { ...character };
    newChar.unspentPoints--;
    newChar[stat] = (newChar[stat] as number) + 1;

    return newChar;
}

/**
 * Get progress percentage for a stat
 * @param progress - Current progress
 * @param level - Current stat level
 * @returns Percentage (0-100)
 */
export function getStatProgressPercentage(progress: number, level: number): number {
    const required = level + 1;
    return Math.round((progress / required) * 100);
}
