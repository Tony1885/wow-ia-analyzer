// ============================================================
// WoW IA Analyzer - Type Definitions
// ============================================================

export interface CombatLogEvent {
    timestamp: string;
    eventType: string;
    sourceGUID: string;
    sourceName: string;
    sourceFlags: string;
    destGUID: string;
    destName: string;
    destFlags: string;
    rawData: string[];
}

export interface PlayerPerformance {
    playerName: string;
    playerClass: WowClass;
    playerSpec: string;
    role: "DPS" | "Healer" | "Tank";
    totalDamage: number;
    totalHealing: number;
    dps: number;
    hps: number;
    fightDuration: number; // in seconds
    percentile: number;
    avoidableDamageTaken: AvoidableDamage[];
    buffUptime: BuffUptime[];
    cooldownUsage: CooldownUsage[];
    timeline: TimelineEvent[];
}

export interface AvoidableDamage {
    abilityName: string;
    hitCount: number;
    totalDamage: number;
    suggestion: string;
    severity: "critical" | "warning" | "minor";
}

export interface BuffUptime {
    buffName: string;
    uptime: number; // percentage 0-100
    expectedUptime: number;
    icon?: string;
}

export interface CooldownUsage {
    cooldownName: string;
    usageCount: number;
    optimalCount: number;
    efficiency: number;
}

export interface TimelineEvent {
    timestamp: number;
    dps: number;
    hps?: number;
    event?: string;
}

export interface AIInsight {
    summary: string;
    strengths: string[];
    improvements: ImprovementItem[];
    actionPlan: ActionItem[];
    overallGrade: string; // S, A, B, C, D, F
    detailedAnalysis: string;
}

export interface ImprovementItem {
    area: string;
    description: string;
    impact: "high" | "medium" | "low";
    priority: number;
}

export interface ActionItem {
    title: string;
    description: string;
    priority: number;
    category: "rotation" | "positioning" | "cooldowns" | "mechanics" | "gear";
}

export interface AnalysisResult {
    performance: PlayerPerformance;
    aiInsight: AIInsight;
    encounter: EncounterInfo;
    metadata: AnalysisMetadata;
    notice?: string;
}

export interface EncounterInfo {
    bossName: string;
    difficulty: "Normal" | "Heroic" | "Mythic" | "Mythic+";
    keystoneLevel?: number;
    dungeonOrRaid: string;
    duration: number;
    wipeOrKill: "Kill" | "Wipe";
}

export interface AnalysisMetadata {
    analyzedAt: string;
    logVersion: string;
    eventsProcessed: number;
    anonymized: boolean;
    model?: string;
}

export type WowClass =
    | "Death Knight"
    | "Demon Hunter"
    | "Druid"
    | "Evoker"
    | "Hunter"
    | "Mage"
    | "Monk"
    | "Paladin"
    | "Priest"
    | "Rogue"
    | "Shaman"
    | "Warlock"
    | "Warrior";

export type AnalysisState =
    | "idle"
    | "uploading"
    | "parsing"
    | "analyzing"
    | "complete"
    | "error";

export interface UploadProgress {
    state: AnalysisState;
    progress: number; // 0-100
    message: string;
    subMessage?: string;
}
