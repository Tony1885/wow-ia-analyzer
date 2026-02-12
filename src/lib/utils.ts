import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
    if (num === undefined || num === null) return "0";
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toFixed(0);
}

export function formatDps(dps: number): string {
    return formatNumber(dps);
}

export function formatPercentage(value: number): string {
    if (value === undefined || value === null) return "0.0%";
    return `${value.toFixed(1)}%`;
}

export function getColorForPercentage(pct: number): string {
    if (pct >= 95) return "#fbbf24"; // legendary gold
    if (pct >= 75) return "#a78bfa"; // epic purple
    if (pct >= 50) return "#3b82f6"; // rare blue
    if (pct >= 25) return "#22c55e"; // uncommon green
    return "#94a3b8"; // common grey
}

export function getRankLabel(pct: number): string {
    if (pct >= 99) return "Legendary";
    if (pct >= 95) return "Epic";
    if (pct >= 75) return "Rare";
    if (pct >= 50) return "Uncommon";
    if (pct >= 25) return "Common";
    return "Poor";
}

export function getRankColor(pct: number): string {
    if (pct >= 99) return "text-legendary-400";
    if (pct >= 95) return "text-epic-400";
    if (pct >= 75) return "text-mana-400";
    if (pct >= 50) return "text-healing-400";
    if (pct >= 25) return "text-white";
    return "text-gray-500";
}
