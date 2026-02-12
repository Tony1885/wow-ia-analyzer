// ============================================================
// Combat Log Parser - WoW Patch 12.1 Compatible
// Parses WoWCombatLog.txt files from the WoW client
// ============================================================

import { CombatLogEvent } from "./types";

// Relevant event types for analysis
const RELEVANT_EVENTS = new Set([
    // Damage
    "SPELL_DAMAGE",
    "SPELL_PERIODIC_DAMAGE",
    "SWING_DAMAGE",
    "RANGE_DAMAGE",
    "SPELL_DAMAGE_SUPPORT",
    "SWING_DAMAGE_LANDED",
    // Healing
    "SPELL_HEAL",
    "SPELL_PERIODIC_HEAL",
    "SPELL_HEAL_ABSORBED",
    // Auras
    "SPELL_AURA_APPLIED",
    "SPELL_AURA_REMOVED",
    "SPELL_AURA_REFRESH",
    "SPELL_AURA_APPLIED_DOSE",
    "SPELL_AURA_REMOVED_DOSE",
    "SPELL_AURA_BROKEN",
    "SPELL_AURA_BROKEN_SPELL",
    // Casts
    "SPELL_CAST_SUCCESS",
    "SPELL_CAST_START",
    "SPELL_CAST_FAILED",
    "SPELL_MISSED",
    // Resources
    "SPELL_ENERGIZE",
    "SPELL_DRAIN",
    // Deaths & units
    "UNIT_DIED",
    "PARTY_KILL",
    "SPELL_INSTAKILL",
    "SPELL_RESURRECT",
    // Encounters
    "ENCOUNTER_START",
    "ENCOUNTER_END",
    "COMBATANT_INFO",
    // Summons
    "SPELL_SUMMON",
    "SPELL_CREATE",
    // Environmental
    "ENVIRONMENTAL_DAMAGE",
    // Absorbs
    "SPELL_ABSORBED",
    // Dispels
    "SPELL_DISPEL",
    "SPELL_STOLEN",
    "SPELL_INTERRUPT",
    // Extra attacks
    "SPELL_EXTRA_ATTACKS",
]);

/**
 * Parse a raw WoW combat log into structured events.
 * Compatible with WoW Patch 12.1 combat log format.
 * Handles both the classic format and the newer COMBAT_LOG_VERSION 21+ format.
 */
export function parseCombatLog(rawLog: string): CombatLogEvent[] {
    const lines = rawLog.split("\n").filter((line) => line.trim().length > 0);
    const events: CombatLogEvent[] = [];

    for (const line of lines) {
        try {
            // Skip header lines (COMBAT_LOG_VERSION, etc.)
            if (
                line.startsWith("COMBAT_LOG_VERSION") ||
                line.startsWith("ZONE_") ||
                line.startsWith("MAP_CHANGE") ||
                line.trim().startsWith("#")
            ) {
                continue;
            }

            const event = parseLine(line);
            if (event && RELEVANT_EVENTS.has(event.eventType)) {
                events.push(event);
            }
        } catch {
            // Skip malformed lines
            continue;
        }
    }

    return events;
}

function parseLine(line: string): CombatLogEvent | null {
    // WoW combat log format examples:
    // Classic: "1/15 20:15:32.456  SPELL_DAMAGE,Player-1234-ABC,..."
    // Newer:   "1/15 20:15:32.4567  SPELL_DAMAGE,Player-1234-ABC,..."
    // Also:    "2/12 14:30:22.123  ENCOUNTER_START,..."

    // Match timestamp: M/D H:M:S.ms (with 2-4 decimal places)
    const timestampMatch = line.match(/^(\d{1,2}\/\d{1,2}\s+[\d:]+\.\d{2,4})\s{2}/);
    if (!timestampMatch) {
        // Try alternate format with date: "2024-01-15T20:15:32.456"
        const isoMatch = line.match(/^(\d{4}-\d{2}-\d{2}T[\d:]+\.\d+)\s+/);
        if (!isoMatch) return null;
        const timestamp = isoMatch[1];
        const dataStr = line.substring(isoMatch[0].length);
        return parseEventData(timestamp, dataStr);
    }

    const timestamp = timestampMatch[1];
    const dataStr = line.substring(timestampMatch[0].length);
    return parseEventData(timestamp, dataStr);
}

function parseEventData(timestamp: string, dataStr: string): CombatLogEvent | null {
    // The event type is the first part before the first comma
    // But some events start with a sub-event prefix
    const parts = splitCSVLine(dataStr);

    if (parts.length < 2) return null;

    const eventType = parts[0];

    // ENCOUNTER_START and ENCOUNTER_END have different formats
    if (eventType === "ENCOUNTER_START" || eventType === "ENCOUNTER_END") {
        return {
            timestamp,
            eventType,
            sourceGUID: "",
            sourceName: "",
            sourceFlags: "",
            destGUID: "",
            destName: "",
            destFlags: "",
            rawData: parts.slice(1),
        };
    }

    // COMBATANT_INFO has a unique format
    if (eventType === "COMBATANT_INFO") {
        return {
            timestamp,
            eventType,
            sourceGUID: parts[1] || "",
            sourceName: "",
            sourceFlags: "",
            destGUID: "",
            destName: "",
            destFlags: "",
            rawData: parts.slice(2),
        };
    }

    // Standard event format: eventType,sourceGUID,sourceName,sourceFlags,sourceRaidFlags,destGUID,destName,destFlags,destRaidFlags,...
    // Note: Newer WoW logs include sourceRaidFlags and destRaidFlags (2 extra fields)
    if (parts.length < 9) {
        // Try with 8 parts (older format without raidFlags)
        if (parts.length >= 5) {
            return {
                timestamp,
                eventType,
                sourceGUID: parts[1] || "",
                sourceName: cleanName(parts[2] || ""),
                sourceFlags: parts[3] || "",
                destGUID: parts[4] || "",
                destName: cleanName(parts[5] || ""),
                destFlags: parts[6] || "",
                rawData: parts.slice(7),
            };
        }
        return null;
    }

    // Modern format (9+ params): includes raidFlags
    return {
        timestamp,
        eventType,
        sourceGUID: parts[1],
        sourceName: cleanName(parts[2]),
        sourceFlags: parts[3],
        // parts[4] = sourceRaidFlags (skip)
        destGUID: parts[5],
        destName: cleanName(parts[6]),
        destFlags: parts[7],
        // parts[8] = destRaidFlags (skip)
        rawData: parts.slice(9),
    };
}

function cleanName(name: string): string {
    // Remove quotes and trim
    return name.replace(/^"/, "").replace(/"$/, "").trim();
}

function splitCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    let bracketDepth = 0;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === "[" || char === "(") {
            bracketDepth++;
            current += char;
        } else if (char === "]" || char === ")") {
            bracketDepth--;
            current += char;
        } else if (char === "," && !inQuotes && bracketDepth === 0) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }

    if (current) {
        result.push(current.trim());
    }

    return result;
}

/**
 * Extract a summary of the combat log for AI processing.
 * Reduces token usage by aggregating data intelligently.
 */
export function summarizeForAI(events: CombatLogEvent[]): string {
    const damageBySource: Record<string, { total: number; abilities: Record<string, number> }> = {};
    const healingBySource: Record<string, { total: number; abilities: Record<string, number> }> = {};
    const avoidableDamage: Array<{ target: string; ability: string; amount: number; timestamp: string }> = [];
    const deaths: string[] = [];
    const auraEvents: string[] = [];
    const encounters: string[] = [];
    const castActivity: Record<string, number> = {};
    let totalDuration = 0;
    let encounterStartTime = "";
    let encounterEndTime = "";

    for (const event of events) {
        switch (event.eventType) {
            case "SPELL_DAMAGE":
            case "SPELL_PERIODIC_DAMAGE":
            case "SWING_DAMAGE":
            case "SWING_DAMAGE_LANDED":
            case "RANGE_DAMAGE": {
                const key = event.sourceName;
                if (!key) break;
                if (!damageBySource[key]) {
                    damageBySource[key] = { total: 0, abilities: {} };
                }
                // Damage amount is in rawData — position varies by event type
                let amount = 0;
                if (event.eventType === "SWING_DAMAGE" || event.eventType === "SWING_DAMAGE_LANDED") {
                    amount = parseInt(event.rawData[0] || "0", 10);
                } else {
                    // SPELL_DAMAGE: spellId, spellName, spellSchool, amount, ...
                    amount = parseInt(event.rawData[3] || event.rawData[0] || "0", 10);
                }
                if (isNaN(amount)) amount = 0;
                damageBySource[key].total += amount;

                const abilityName = event.eventType.startsWith("SWING")
                    ? "Melee"
                    : cleanName(event.rawData[1] || event.rawData[0] || "Unknown");
                damageBySource[key].abilities[abilityName] =
                    (damageBySource[key].abilities[abilityName] || 0) + amount;
                break;
            }

            case "SPELL_HEAL":
            case "SPELL_PERIODIC_HEAL": {
                const key = event.sourceName;
                if (!key) break;
                if (!healingBySource[key]) {
                    healingBySource[key] = { total: 0, abilities: {} };
                }
                const amount = parseInt(event.rawData[3] || event.rawData[0] || "0", 10);
                if (!isNaN(amount)) {
                    healingBySource[key].total += amount;
                    const abilityName = cleanName(event.rawData[1] || event.rawData[0] || "Unknown");
                    healingBySource[key].abilities[abilityName] =
                        (healingBySource[key].abilities[abilityName] || 0) + amount;
                }
                break;
            }

            case "UNIT_DIED":
                deaths.push(`${event.destName} died at ${event.timestamp}`);
                break;

            case "ENCOUNTER_START":
                encounterStartTime = event.timestamp;
                encounters.push(`ENCOUNTER_START: ${event.rawData.join(",")}`);
                break;

            case "ENCOUNTER_END":
                encounterEndTime = event.timestamp;
                encounters.push(`ENCOUNTER_END: ${event.rawData.join(",")}`);
                break;

            case "SPELL_AURA_APPLIED":
            case "SPELL_AURA_REMOVED":
            case "SPELL_AURA_REFRESH":
                if (auraEvents.length < 800) {
                    const spellName = cleanName(event.rawData[1] || event.rawData[0] || "unknown");
                    auraEvents.push(
                        `${event.timestamp}: ${event.eventType} - ${event.sourceName} -> ${event.destName}: ${spellName}`
                    );
                }
                break;

            case "SPELL_CAST_SUCCESS": {
                const castKey = `${event.sourceName}:${cleanName(event.rawData[1] || event.rawData[0] || "Unknown")}`;
                castActivity[castKey] = (castActivity[castKey] || 0) + 1;
                break;
            }

            case "SPELL_MISSED": {
                const missedAbility = cleanName(event.rawData[1] || event.rawData[0] || "Unknown");
                avoidableDamage.push({
                    target: event.destName,
                    ability: missedAbility,
                    amount: 0,
                    timestamp: event.timestamp,
                });
                break;
            }
        }
    }

    // Build comprehensive summary
    const topDamagers = Object.entries(damageBySource)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 25);

    const topHealers = Object.entries(healingBySource)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 15);

    const summary = [
        `=== WOW COMBAT LOG ANALYSIS — Patch 12.1 ===`,
        `Total events parsed: ${events.length}`,
        ...encounters,
        `\n--- TOTAL DAMAGE BY SOURCE (Top 25) ---`,
        ...topDamagers.map(([name, data]) => {
            const topAbilities = Object.entries(data.abilities)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([spell, dmg]) => `  • ${spell}: ${dmg.toLocaleString()}`)
                .join("\n");
            return `${name}: ${data.total.toLocaleString()} total\n${topAbilities}`;
        }),
        `\n--- TOTAL HEALING BY SOURCE (Top 15) ---`,
        ...topHealers.map(([name, data]) => {
            const topAbilities = Object.entries(data.abilities)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([spell, heal]) => `  • ${spell}: ${heal.toLocaleString()}`)
                .join("\n");
            return `${name}: ${data.total.toLocaleString()} total\n${topAbilities}`;
        }),
        `\n--- DEATHS ---`,
        ...deaths.slice(0, 30),
        `\n--- CAST ACTIVITY (Top 40 by frequency) ---`,
        ...Object.entries(castActivity)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 40)
            .map(([key, count]) => `${key}: ${count} casts`),
        `\n--- KEY AURA EVENTS (sample of ${auraEvents.length}) ---`,
        ...auraEvents.slice(0, 150),
    ].join("\n");

    return summary;
}

/**
 * Anonymize player names in the log data (RGPD)
 */
export function anonymizeNames(
    events: CombatLogEvent[]
): CombatLogEvent[] {
    const nameMap = new Map<string, string>();
    let counter = 1;

    const isPlayerGUID = (guid: string): boolean => {
        return guid.startsWith("Player-") || guid.startsWith("Pet-");
    };

    const getAnonymized = (name: string, guid: string): string => {
        if (!name || !isPlayerGUID(guid)) return name;
        if (!nameMap.has(name)) {
            nameMap.set(name, `Joueur${counter++}`);
        }
        return nameMap.get(name)!;
    };

    return events.map((event) => ({
        ...event,
        sourceName: getAnonymized(event.sourceName, event.sourceGUID),
        destName: event.destName ? getAnonymized(event.destName, event.destGUID) : "",
    }));
}

/**
 * Validate that a file looks like a WoW combat log.
 * Supports all WoW combat log formats from patch 10.x to 12.1+
 */
export function validateCombatLog(content: string): {
    valid: boolean;
    error?: string;
} {
    if (!content || content.trim().length === 0) {
        return { valid: false, error: "Le fichier est vide." };
    }

    const lines = content.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length < 5) {
        return {
            valid: false,
            error: "Le fichier est trop court pour être un log de combat valide.",
        };
    }

    // Check if first lines are headers or contain combat events
    // WoW combat logs can start with COMBAT_LOG_VERSION header or directly with events
    const timestampPattern = /^\d{1,2}\/\d{1,2}\s+[\d:]+\.\d{2,4}\s{2}/;
    const headerPattern = /^COMBAT_LOG_VERSION/;
    const altTimestampPattern = /^\d{4}-\d{2}-\d{2}T[\d:]+/;

    let matchCount = 0;
    let isHeader = false;

    for (let i = 0; i < Math.min(20, lines.length); i++) {
        const line = lines[i].trim();
        if (timestampPattern.test(line) || altTimestampPattern.test(line)) {
            matchCount++;
        }
        if (headerPattern.test(line)) {
            isHeader = true;
            matchCount++; // Count header as valid
        }
    }

    if (matchCount < 2) {
        return {
            valid: false,
            error:
                "Le format du fichier ne correspond pas à un log de combat WoW. Assurez-vous d'utiliser le fichier WoWCombatLog.txt situé dans votre dossier Logs de WoW (_retail_/Logs/).",
        };
    }

    return { valid: true };
}
