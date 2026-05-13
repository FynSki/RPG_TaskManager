/**
 * RarityBadge — badge rzadkoœci zadania
 * Wyci¹gniêty z App.tsx (linia ~162)
 */

type Rarity = "common" | "rare" | "epic" | "legendary" | "unique";

const RARITY_STYLES: Record<Rarity, { bg: string; text: string; border: string }> = {
    common: { bg: "bg-slate-700", text: "text-slate-300", border: "border-slate-600" },
    rare: { bg: "bg-blue-900", text: "text-blue-300", border: "border-blue-700" },
    epic: { bg: "bg-purple-900", text: "text-purple-300", border: "border-purple-700" },
    legendary: { bg: "bg-orange-900", text: "text-orange-300", border: "border-orange-700" },
    unique: { bg: "bg-yellow-900", text: "text-yellow-300", border: "border-yellow-700" },
};

export function getRarityColor(rarity: string) {
    return RARITY_STYLES[rarity as Rarity] ?? RARITY_STYLES.common;
}

export function getRarityDisplay(rarity: string): string {
    if (rarity === "low") return "Common";
    if (rarity === "medium") return "Rare";
    if (rarity === "high") return "Epic";
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

type Props = {
    rarity: Rarity;
    showXP?: boolean;
    xp?: number;
};

export function RarityBadge({ rarity, showXP = false, xp }: Props) {
    const styles = RARITY_STYLES[rarity] ?? RARITY_STYLES.common;
    const label = getRarityDisplay(rarity);

    return (
        <span className={`text-xs px-2 sm:px-3 py-1 rounded-full ${styles.bg} ${styles.text} border ${styles.border}`}>
            {label}{showXP && xp !== undefined ? ` (${xp} XP)` : ""}
        </span>
    );
}