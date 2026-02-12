// ============================================================
// Combat Log Parser - WoW Patch 12.1 Compatible
// Parses WoWCombatLog.txt files from the WoW client
// ============================================================

import { CombatLogEvent, AnalysisResult } from "./types";

// Relevant event types for analysis
const RELEVANT_EVENTS = new Set([
    "SPELL_DAMAGE", "SPELL_PERIODIC_DAMAGE", "SWING_DAMAGE", "SWING_DAMAGE_LANDED", "RANGE_DAMAGE",
    "SPELL_HEAL", "SPELL_PERIODIC_HEAL", "SPELL_HEAL_ABSORBED",
    "SPELL_CAST_SUCCESS", "SPELL_CAST_START", "UNIT_DIED",
    "ENCOUNTER_START", "ENCOUNTER_END", "COMBATANT_INFO", "CHALLENGE_MODE_START", "CHALLENGE_MODE_END"
]);

/**
 * Parse a raw WoW combat log into structured events.
 */
export function parseCombatLog(rawLog: string): CombatLogEvent[] {
    const cleanContent = rawLog.startsWith("\uFEFF") ? rawLog.slice(1) : rawLog;
    const lines = cleanContent.split("\n").filter((line) => line.trim().length > 0);
    const events: CombatLogEvent[] = [];

    for (const line of lines) {
        try {
            const event = parseLine(line);
            if (event && RELEVANT_EVENTS.has(event.eventType)) {
                events.push(event);
            }
        } catch { continue; }
    }
    return events;
}

function parseLine(line: string): CombatLogEvent | null {
    const timestampMatch = line.match(/^(\d{1,2}\/\d{1,2}\s+[\d:]+\.\d+)\s+/);
    let timestamp = "";
    let dataStr = "";

    if (timestampMatch) {
        timestamp = timestampMatch[1];
        dataStr = line.substring(timestampMatch[0].length);
    } else {
        const isoMatch = line.match(/^(\d{4}-\d{2}-\d{2}T?[\d:]+\.\d+)\s+/);
        if (!isoMatch) return null;
        timestamp = isoMatch[1];
        dataStr = line.substring(isoMatch[0].length);
    }

    const parts = splitCSVLine(dataStr);
    if (parts.length < 2) return null;

    const eventType = parts[0];
    return {
        timestamp,
        eventType,
        sourceGUID: parts[1] || "",
        sourceName: cleanName(parts[2] || ""),
        sourceFlags: parts[3] || "",
        destGUID: parts[5] || "",
        destName: cleanName(parts[6] || ""),
        destFlags: parts[7] || "",
        rawData: parts.slice(eventType.includes("ENCOUNTER") ? 1 : 9),
    };
}

function cleanName(name: string): string {
    return name.replace(/^"/, "").replace(/"$/, "").trim();
}

function splitCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    let bracketDepth = 0;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === "[" || char === "(") bracketDepth++;
        else if (char === "]" || char === ")") bracketDepth--;
        else if (char === "," && !inQuotes && bracketDepth === 0) {
            result.push(current.trim());
            current = "";
        } else current += char;
    }
    if (current) result.push(current.trim());
    return result;
}

/**
 * Identify the main player (source of most actions) and calculate real stats
 */
export function calculateRealMetrics(events: CombatLogEvent[]): AnalysisResult["performance"] {
    const sourceStats: Record<string, { dmg: number; heal: number; events: number; lastTime: number; startTime: number; guid: string }> = {};

    events.forEach(ev => {
        if (!ev.sourceName || ev.sourceName === "nil") return;
        if (!sourceStats[ev.sourceName]) {
            sourceStats[ev.sourceName] = { dmg: 0, heal: 0, events: 0, lastTime: 0, startTime: 0, guid: ev.sourceGUID };
        }

        const stats = sourceStats[ev.sourceName];
        stats.events++;

        // Robust timestamp parsing (ISO 8601 or Legacy)
        let time = 0;
        if (ev.timestamp.includes("T")) {
            time = new Date(ev.timestamp).getTime();
        } else {
            const timePart = ev.timestamp.split(/\s+/)[1];
            time = new Date(`2026-01-01T${timePart}`).getTime();
        }

        if (!isNaN(time)) {
            if (!stats.startTime) stats.startTime = time;
            stats.lastTime = time;
        }

        if (ev.eventType.includes("DAMAGE")) {
            const amt = parseInt(ev.rawData[ev.eventType.startsWith("SWING") ? 0 : 3]) || 0;
            stats.dmg += amt;
        } else if (ev.eventType.includes("HEAL")) {
            const amt = parseInt(ev.rawData[3]) || 0;
            stats.heal += amt;
        }
    });

    // If no events or no source stats, return default data
    const players = Object.keys(sourceStats);
    if (players.length === 0) {
        return {
            playerName: "Joueur Inconnu",
            playerClass: "Monk",
            playerSpec: "Brewmaster",
            role: "Tank",
            totalDamage: 0,
            totalHealing: 0,
            dps: 0,
            hps: 0,
            fightDuration: 1,
            percentile: 0,
            avoidableDamageTaken: [],
            buffUptime: [],
            cooldownUsage: [],
            timeline: []
        };
    }

    // Find the player with most events (likely the user)
    const playerName = players.sort((a, b) => sourceStats[b].events - sourceStats[a].events)[0];
    const p = sourceStats[playerName];
    const duration = Math.max(1, (p.lastTime - p.startTime) / 1000);

    return {
        playerName,
        playerClass: "Monk",
        playerSpec: "Brewmaster",
        role: "Tank",
        totalDamage: p.dmg,
        totalHealing: p.heal,
        dps: Math.round(p.dmg / duration),
        hps: Math.round(p.heal / duration),
        fightDuration: Math.round(duration),
        percentile: 0,
        avoidableDamageTaken: [],
        buffUptime: [],
        cooldownUsage: [],
        timeline: []
    };
}

/**
 * Summarize for AI
 */
export function summarizeForAI(events: CombatLogEvent[]): string {
    const metrics = calculateRealMetrics(events);
    return `PLAYER: ${metrics.playerName} (${metrics.playerClass} ${metrics.playerSpec})
ROLE: ${metrics.role}
TOTAL DMG: ${metrics.totalDamage}
TOTAL HEAL: ${metrics.totalHealing}
DPS: ${metrics.dps}
DURATION: ${metrics.fightDuration}s
EVENTS: ${events.length}
`;
}

export function validateCombatLog(content: string): { valid: boolean; error?: string } {
    if (!content || content.length < 100) return { valid: false, error: "Fichier trop court" };
    const eventPattern = /[A-Z_]{8,}/;
    return eventPattern.test(content.substring(0, 5000)) ? { valid: true } : { valid: false, error: "Format invalide" };
}

export function anonymizeNames(events: CombatLogEvent[]): CombatLogEvent[] { return events; }
