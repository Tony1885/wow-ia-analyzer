// ============================================================
// Mock Data for Demo & Development — WoW Patch 12.1
// ============================================================

import { AnalysisResult } from "./types";

export function generateMockAnalysis(): AnalysisResult {
    return {
        performance: {
            playerName: "Shadowmeld",
            playerClass: "Mage",
            playerSpec: "Fire",
            role: "DPS",
            totalDamage: 612_450_300,
            totalHealing: 3_250_100,
            dps: 118_720,
            hps: 630,
            fightDuration: 326,
            percentile: 91,
            avoidableDamageTaken: [
                {
                    abilityName: "Détonation de Gallywix",
                    hitCount: 2,
                    totalDamage: 1_850_000,
                    suggestion:
                        "Déplacez-vous immédiatement quand Gallywix lance Détonation. Utilisez Transposition ou Bouclier de givre pour mitiger si vous êtes ciblé.",
                    severity: "critical",
                },
                {
                    abilityName: "Éclat de dynamite",
                    hitCount: 3,
                    totalDamage: 720_000,
                    suggestion:
                        "Les zones de dynamite sont prévisibles. Pré-positionnez-vous à l'écart des zones marquées au sol 2s avant l'impact.",
                    severity: "warning",
                },
                {
                    abilityName: "Onde de choc mécanique",
                    hitCount: 1,
                    totalDamage: 280_000,
                    suggestion:
                        "Restez derrière le boss pendant la phase de transition. Mineur mais évitable avec un bon timing.",
                    severity: "minor",
                },
            ],
            buffUptime: [
                {
                    buffName: "Fiole d'alchimiste",
                    uptime: 100,
                    expectedUptime: 100,
                },
                {
                    buffName: "Combustion",
                    uptime: 89.2,
                    expectedUptime: 92,
                },
                {
                    buffName: "Présence ardente",
                    uptime: 81.5,
                    expectedUptime: 88,
                },
                {
                    buffName: "Enchantement arme",
                    uptime: 100,
                    expectedUptime: 100,
                },
                {
                    buffName: "Nourriture Well Fed",
                    uptime: 100,
                    expectedUptime: 100,
                },
            ],
            cooldownUsage: [
                {
                    cooldownName: "Combustion",
                    usageCount: 5,
                    optimalCount: 5,
                    efficiency: 100,
                },
                {
                    cooldownName: "Pouvoir arcanique",
                    usageCount: 3,
                    optimalCount: 3,
                    efficiency: 100,
                },
                {
                    cooldownName: "Transposition",
                    usageCount: 3,
                    optimalCount: 5,
                    efficiency: 60,
                },
            ],
            timeline: generateTimeline(326),
        },
        aiInsight: {
            summary:
                "Excellente performance globale sur Gallywix Mythique — ton opener avec Combustion + Présence ardente était parfaitement timé et aligné avec la Bloodlust. Cependant, tu as perdu environ 12% d'uptime DPS en phase 2 à cause de 2 hits par Détonation qui ont forcé des mouvements non planifiés. Avec une meilleure anticipation des mécaniques, tu pourrais facilement passer au-dessus du 95e percentile.",
            strengths: [
                "Opener exemplaire avec Combustion parfaitement synchronisée à la Bloodlust",
                "Temps de cast très faible (< 1.5% dead GCD) — excellent ABC (Always Be Casting)",
                "Gestion parfaite des consommables et buffs de pré-pull",
                "5/5 Combustions utilisées — aucun CD gaspillé",
                "DPS au-dessus du 91e percentile pour un Mage Feu sur ce boss",
            ],
            improvements: [
                {
                    area: "Gestion des mécaniques de Gallywix",
                    description:
                        "2 hits évitables par Détonation ont causé 1.85M de dégâts et forcé des mouvements non planifiés, résultant en une perte de ~12% d'uptime DPS sur la phase 2",
                    impact: "high",
                    priority: 1,
                },
                {
                    area: "Uptime de Présence ardente",
                    description:
                        "Présence ardente à 81.5% d'uptime au lieu de 88% optimal. Chaque drop de buff pendant un mouvement coûte ~3-5% de DPS. Re-appliquez immédiatement après chaque mouvement forcé.",
                    impact: "high",
                    priority: 2,
                },
                {
                    area: "Utilisation défensive de Transposition",
                    description:
                        "Seulement 3/5 Transpositions utilisées. Elles auraient pu éviter les 2 hits de Détonation en phase 2.",
                    impact: "medium",
                    priority: 3,
                },
            ],
            actionPlan: [
                {
                    title: "Anticiper les Détonations de Gallywix",
                    description:
                        "Les Détonations arrivent toutes les 40s en phase 2. Installez un WeakAura avec timer. Pré-positionnez-vous 3s avant le cast et utilisez Transposition pour revenir au melee range immédiatement après.",
                    priority: 1,
                    category: "mechanics",
                },
                {
                    title: "Maximiser l'uptime de Présence ardente",
                    description:
                        "Créez un WeakAura visuel+audio pour le drop de Présence ardente. Objectif : ne jamais dépasser 1.5s sans le buff. Sur Gallywix, re-cast immédiatement après chaque mouvement. Cible : 88%+ d'uptime.",
                    priority: 2,
                    category: "rotation",
                },
                {
                    title: "Planifier les CDs défensifs avec les timers de boss",
                    description:
                        "Associez chaque Transposition à une mécanique spécifique : T1 à la 1ère Détonation P2, T2 au 2ème, T3 comme safety net. Bloc de glace en emergency seulement.",
                    priority: 3,
                    category: "cooldowns",
                },
            ],
            overallGrade: "A",
            detailedAnalysis:
                "Analyse complète de 326 secondes de combat sur Gallywix Mythique. 612M de dégâts totaux infligés avec un DPS moyen de 118.7k, plaçant la performance au 91e percentile pour un Mage Feu en patch 12.1. L'opener a généré un pic de 285k DPS ce qui est dans le top 10% des openers sur ce boss. La phase 1 était quasi parfaite avec un uptime de 97%. La chute de performance en P2 est clairement liée aux 2 Détonations prises, créant une baisse de DPS de 12% sur cette window. Les axes d'amélioration identifiés pourraient augmenter le DPS de 8-12% et permettre d'atteindre le 95e+ percentile confortablement.",
        },
        encounter: {
            bossName: "Gallywix",
            difficulty: "Mythic",
            dungeonOrRaid: "Libération d'Undermine",
            duration: 326,
            wipeOrKill: "Kill",
        },
        metadata: {
            analyzedAt: new Date().toISOString(),
            logVersion: "12.1",
            eventsProcessed: 187_432,
            anonymized: false,
        },
    };
}

function generateTimeline(duration: number) {
    const timeline = [];
    const baselineDps = 115000;
    const burstWindows = [
        { start: 0, end: 15 },   // Opener + BL
        { start: 75, end: 90 },   // 2nd Combustion
        { start: 150, end: 165 }, // 3rd Combustion
        { start: 210, end: 225 }, // 4th Combustion
        { start: 290, end: 305 }, // 5th Combustion (execute phase)
    ];
    const mechanicDips = [
        { start: 100, end: 108 }, // Détonation P2 hit 1
        { start: 180, end: 188 }, // Détonation P2 hit 2
    ];

    for (let t = 0; t <= duration; t += 3) {
        let dps = baselineDps + (Math.random() - 0.5) * 18000;

        // Burst windows
        for (const w of burstWindows) {
            if (t >= w.start && t <= w.end) {
                dps *= 1.9 + Math.random() * 0.5;
            }
        }

        // Execute phase ramp
        if (t >= 260) {
            dps *= 1.1 + (t - 260) / 200;
        }

        // Mechanic dips
        for (const d of mechanicDips) {
            if (t >= d.start && t <= d.end) {
                dps *= 0.25 + Math.random() * 0.15;
            }
        }

        timeline.push({
            timestamp: t,
            dps: Math.round(dps),
        });
    }

    return timeline;
}
