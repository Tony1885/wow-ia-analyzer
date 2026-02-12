// ============================================================
// Combat Log Parser - WoW Patch 11.x/12.x Compatible
// Parses WoWCombatLog.txt files with advanced detection
// ============================================================

import { CombatLogEvent, AnalysisResult, WowClass, EncounterInfo } from "./types";

const RELEVANT_EVENTS = new Set([
    "SPELL_DAMAGE", "SPELL_PERIODIC_DAMAGE", "SWING_DAMAGE", "SWING_DAMAGE_LANDED", "RANGE_DAMAGE",
    "SPELL_HEAL", "SPELL_PERIODIC_HEAL", "SPELL_HEAL_ABSORBED",
    "SPELL_CAST_SUCCESS", "SPELL_CAST_START", "UNIT_DIED",
    "ENCOUNTER_START", "ENCOUNTER_END", "COMBATANT_INFO", "CHALLENGE_MODE_START", "CHALLENGE_MODE_END"
]);

export function parseCombatLog(rawLog: string): CombatLogEvent[] {
    const cleanContent = rawLog.startsWith("\uFEFF") ? rawLog.slice(1) : rawLog;
    const lines = cleanContent.split("\n");
    const events: CombatLogEvent[] = [];

    for (const line of lines) {
        if (line.length < 20) continue;
        const event = parseLine(line);
        if (event && RELEVANT_EVENTS.has(event.eventType)) {
            events.push(event);
        }
    }
    return events;
}

function parseLine(line: string): CombatLogEvent | null {
    // Flexible timestamp detection (Standard WoW or ISO)
    const match = line.match(/^(\d{1,2}\/\d{1,2}\s+[\d:.]+|\d{4}-\d{2}-\d{2}T[\d:.]+)\s+(.+)$/);
    if (!match) return null;

    const timestamp = match[1];
    const dataStr = match[2];

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
        rawData: parts.slice(eventType.includes("ENCOUNTER") || eventType.includes("CHALLENGE") || eventType === "COMBATANT_INFO" ? 1 : 9),
    };
}

function cleanName(name: string): string {
    return name.replace(/^"/, "").replace(/"$/, "").replace(/nil/, "").trim();
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

export function calculateRealMetrics(events: CombatLogEvent[], targetPlayerName?: string): { performance: AnalysisResult["performance"]; encounter: EncounterInfo } {
    const stats: Record<string, { dmg: number; heal: number; events: number; lastTime: number; startTime: number; guid: string; name: string }> = {};
    const avoidableDamage: Record<string, { count: number; total: number }> = {};
    const timelineData: Record<number, { dps: number; hps: number }> = {};

    let dungeonName = "Donjon Mythique+";
    let bossName = "Plusieurs Boss";
    let difficulty: EncounterInfo["difficulty"] = "Normal";
    let keystoneLevel = 0;

    const playerInfo: Record<string, { classId: number, specId: number }> = {};

    events.forEach(ev => {
        if (ev.eventType === "CHALLENGE_MODE_START") {
            dungeonName = ev.rawData[0] || dungeonName;
            difficulty = "Mythic+";
            keystoneLevel = parseInt(ev.rawData[3]) || 0;
        } else if (ev.eventType === "ENCOUNTER_START") {
            bossName = ev.rawData[1] || bossName;
        } else if (ev.eventType === "COMBATANT_INFO") {
            const guid = ev.sourceGUID;
            const classId = parseInt(ev.rawData[1]);
            const specId = parseInt(ev.rawData[2]);
            if (guid && !isNaN(classId)) {
                playerInfo[guid] = { classId, specId };
            }
        }
    });

    const year = new Date().getFullYear();
    events.forEach(ev => {
        if (ev.eventType.includes("ENCOUNTER") || ev.eventType.includes("CHALLENGE") || ev.eventType === "COMBATANT_INFO") return;

        const guid = ev.sourceGUID;
        if (!guid || !guid.startsWith("Player-")) return;

        if (!stats[guid]) {
            stats[guid] = { dmg: 0, heal: 0, events: 0, lastTime: 0, startTime: 0, guid: guid, name: ev.sourceName || "Joueur" };
        }

        const p = stats[guid];
        p.events++;
        if (ev.sourceName && ev.sourceName !== "Joueur" && ev.sourceName !== "nil") {
            p.name = ev.sourceName;
        }

        // Robust timestamp parsing
        let time = 0;
        try {
            if (ev.timestamp.includes("T")) {
                time = new Date(ev.timestamp).getTime();
            } else {
                const parts = ev.timestamp.split(/\s+/);
                const timePart = parts[1] || parts[0];
                time = new Date(`${year}-01-01T${timePart}`).getTime();
            }
            if (!isNaN(time)) {
                if (!p.startTime) p.startTime = time;
                p.lastTime = time;

                // Timeline bucket (every 5 seconds)
                const bucket = Math.floor(time / 5000) * 5000;
                if (!timelineData[bucket]) timelineData[bucket] = { dps: 0, hps: 0 };
            }
        } catch (e) { }

        // Metrics
        if (ev.eventType.includes("DAMAGE")) {
            const idx = ev.eventType.startsWith("SWING") ? 0 : 3;
            const amtStr = ev.rawData[idx];
            const amt = parseInt(amtStr) || 0;
            p.dmg += amt;

            if (time > 0) {
                const bucket = Math.floor(time / 5000) * 5000;
                if (timelineData[bucket]) timelineData[bucket].dps += amt;
            }

            // Basic Avoidable Damage Check (Damage taken by player from NPCs)
            if (ev.destGUID === guid && ev.sourceGUID.startsWith("Creature-")) {
                const spellName = ev.eventType.startsWith("SWING") ? "Attaque de mêlée" : (ev.rawData[1] || "Capacité Inconnue");
                if (!avoidableDamage[spellName]) avoidableDamage[spellName] = { count: 0, total: 0 };
                avoidableDamage[spellName].count++;
                avoidableDamage[spellName].total += amt;
            }
        } else if (ev.eventType.includes("HEAL")) {
            const amt = parseInt(ev.rawData[3]) || 0;
            p.heal += amt;
            if (time > 0) {
                const bucket = Math.floor(time / 5000) * 5000;
                if (timelineData[bucket]) timelineData[bucket].hps += amt;
            }
        }
    });

    const playerGUIDs = Object.keys(stats);
    if (playerGUIDs.length === 0) {
        return { performance: createDefaultPerformance(), encounter: createDefaultEncounter() };
    }

    // Identify main player
    let mainGUID = "";
    if (targetPlayerName) {
        mainGUID = playerGUIDs.find(guid => stats[guid].name.toLowerCase() === targetPlayerName.toLowerCase()) || "";
    }

    if (!mainGUID) {
        mainGUID = playerGUIDs.sort((a, b) => stats[b].events - stats[a].events)[0];
    }

    const p = stats[mainGUID];
    const duration = Math.max(1, (p.lastTime - p.startTime) / 1000);

    // Map Class/Spec
    const info = playerInfo[mainGUID];
    const { playerClass, playerSpec, role } = getPlayerContext(info?.classId, info?.specId);

    // Format Timeline
    const timeline = Object.keys(timelineData)
        .map(ts => ({
            timestamp: parseInt(ts),
            dps: Math.round(timelineData[parseInt(ts)].dps / 5),
            hps: Math.round(timelineData[parseInt(ts)].hps / 5)
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

    // Format Avoidable Damage
    const avoidable = Object.entries(avoidableDamage)
        .map(([name, data]) => ({
            abilityName: name,
            hitCount: data.count,
            totalDamage: data.total,
            suggestion: "Évitez cette capacité au prochain combat pour réduire la pression sur le soigneur.",
            severity: (data.total > p.dmg * 0.1 ? "critical" : "warning") as "critical" | "warning"
        }))
        .sort((a, b) => b.totalDamage - a.totalDamage)
        .slice(0, 5);

    return {
        performance: {
            playerName: p.name,
            playerClass,
            playerSpec,
            role,
            totalDamage: p.dmg,
            totalHealing: p.heal,
            dps: Math.round(p.dmg / duration),
            hps: Math.round(p.heal / duration),
            fightDuration: Math.round(duration),
            percentile: 0,
            avoidableDamageTaken: avoidable,
            buffUptime: [],
            cooldownUsage: [],
            timeline: timeline
        },
        encounter: {
            bossName,
            difficulty: difficulty,
            keystoneLevel: keystoneLevel > 0 ? keystoneLevel : undefined,
            dungeonOrRaid: dungeonName,
            duration: Math.round(duration),
            wipeOrKill: "Kill"
        }
    };
}

function createDefaultPerformance(): AnalysisResult["performance"] {
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

function createDefaultEncounter(): EncounterInfo {
    return {
        bossName: "Donjon / Raid",
        difficulty: "Normal",
        dungeonOrRaid: "Analyse Locale",
        duration: 0,
        wipeOrKill: "Kill"
    };
}

export function validateCombatLog(content: string): { valid: boolean; error?: string } {
    if (!content || content.length < 100) return { valid: false, error: "Fichier trop court" };
    return content.includes("COMBAT_LOG_EVENT") || content.includes("_DAMAGE") ? { valid: true } : { valid: false, error: "Format invalide" };
}

export function summarizeForAI(events: CombatLogEvent[]): string {
    const { performance: p } = calculateRealMetrics(events);
    return `PLAYER: ${p.playerName}\nDPS: ${p.dps}\nHEAL: ${p.totalHealing}\nDURATION: ${p.fightDuration}s`;
}

/**
 * Nettoyage et pré-parsing des logs bruts pour analyse directe
 */
export function cleanRawLogs(input: string): {
    cleanedText: string,
    sourceName: string,
    stats: { casts: number, damageTaken: number, deaths: number }
} {
    const lines = input.split("\n");
    const counts: Record<string, number> = {};
    let damageTaken = 0;
    let deaths = 0;
    let casts = 0;

    // Filter relevant lines and identify main player
    const relevantLines = lines.filter(line => {
        const isRelevant = line.includes("SPELL_CAST_SUCCESS") ||
            line.includes("SPELL_DAMAGE") ||
            line.includes("UNIT_DIED") ||
            line.includes("SPELL_AURA_APPLIED");

        if (isRelevant) {
            const parts = line.split(",");
            const sourceName = parts[2]?.replace(/"/g, "");
            if (sourceName && sourceName !== "nil" && !sourceName.includes("-")) { // Avoid NPC IDs
                counts[sourceName] = (counts[sourceName] || 0) + 1;
            }
            if (line.includes("SPELL_CAST_SUCCESS")) casts++;
            if (line.includes("UNIT_DIED")) deaths++;
        }
        return isRelevant;
    });

    // Identify main player (most events)
    const sourceName = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Joueur Inconnu";

    // Re-scan for specific stats of that player
    relevantLines.forEach(line => {
        if (line.includes("SPELL_DAMAGE") && line.includes(sourceName)) {
            const parts = line.split(",");
            // Check if player is the target (destName)
            if (parts[6]?.includes(sourceName)) {
                damageTaken += parseInt(parts[parts.length - 15]) || 0;
            }
        }
    });

    return {
        cleanedText: relevantLines.slice(0, 500).join("\n"), // Limit for Gemini
        sourceName,
        stats: { casts, damageTaken, deaths }
    };
}

export function anonymizeNames(events: CombatLogEvent[]): CombatLogEvent[] { return events; }

// --- Helpers ---

function getPlayerContext(classId?: number, specId?: number): { playerClass: WowClass, playerSpec: string, role: "DPS" | "Healer" | "Tank" } {
    const classMap: Record<number, WowClass> = {
        1: "Warrior", 2: "Paladin", 3: "Hunter", 4: "Rogue", 5: "Priest",
        6: "Death Knight", 7: "Shaman", 8: "Mage", 9: "Warlock", 10: "Monk",
        11: "Druid", 12: "Demon Hunter", 13: "Evoker"
    };

    const specMap: Record<number, { name: string, role: "DPS" | "Healer" | "Tank" }> = {
        // Monk
        268: { name: "Brewmaster", role: "Tank" },
        270: { name: "Mistweaver", role: "Healer" },
        269: { name: "Windwalker", role: "DPS" },
        // Paladin
        65: { name: "Holy", role: "Healer" },
        66: { name: "Protection", role: "Tank" },
        70: { name: "Retribution", role: "DPS" },
        // Druid
        102: { name: "Balance", role: "DPS" },
        103: { name: "Feral", role: "DPS" },
        104: { name: "Guardian", role: "Tank" },
        105: { name: "Restoration", role: "Healer" },
        // ... add more as needed, but this covers the basics
    };

    const playerClass = classMap[classId || 0] || "Monk";
    const specInfo = specMap[specId || 0] || { name: "Inconnu", role: "DPS" };

    return {
        playerClass: playerClass as WowClass,
        playerSpec: specInfo.name,
        role: specInfo.role
    };
}
