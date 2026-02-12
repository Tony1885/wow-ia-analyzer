// ============================================================
// API Route: /api/analyze
// Handles combat log upload and AI analysis via Google Gemini 1.5 Flash
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { parseLogsForGemini } from "@/lib/parse-logs";
import { generateMockAnalysis } from "@/lib/mock-data";
import { fetchWCLRankings, slugifyServer } from "@/lib/wcl-api";

export const maxDuration = 120; // 2 minutes timeout for Vercel

export async function POST(request: NextRequest) {
    let performanceStr = "";
    let encounterStr = "";
    try {
        const formData = await request.formData();
        let geminiContext = formData.get("geminiContext") as string | null;
        performanceStr = formData.get("performance") as string || "";
        encounterStr = formData.get("encounter") as string || "";
        const charInfoStr = formData.get("characterInfo") as string | null;
        const anonymize = formData.get("anonymize") === "true";
        const demoMode = formData.get("demo") === "true";
        const wclOnly = formData.get("wclOnly") === "true";

        const rawLog = formData.get("rawLog") as string | null;

        // Mode démo - retour immédiat de données simulées
        if (demoMode) {
            return NextResponse.json({
                success: true,
                data: generateMockAnalysis(),
                notice: "Mode démo activé",
            });
        }

        let charInfo = charInfoStr ? JSON.parse(charInfoStr) : null;
        let reportCode = charInfo?.reportCode;

        console.log("[API] Analysis Request:", {
            hasFile: !!geminiContext,
            hasRawLog: !!rawLog,
            wclOnly,
            charName: charInfo?.charName,
            reportCode
        });

        // --- NEW: RAW LOG ANALYSIS ---
        if (rawLog) {
            console.log("[API] Processing Raw Log Analysis");
            const { cleanRawLogs } = require("@/lib/log-parser");
            const cleaned = cleanRawLogs(rawLog);

            geminiContext = cleaned.cleanedText;
            const realPerformance = {
                playerName: cleaned.sourceName,
                playerClass: "Warrior", // Fallback, Gemini will refine
                playerSpec: "Inconnu",
                role: "DPS",
                dps: 0,
                totalDamage: 0,
                totalHealing: 0,
                hps: 0,
                fightDuration: 0,
                percentile: 0,
                avoidableDamageTaken: [],
                buffUptime: [],
                cooldownUsage: [],
                timeline: [],
                rawStats: cleaned.stats
            };
            const realEncounter = {
                bossName: "Extrait Brut",
                difficulty: "Mythic+",
                dungeonOrRaid: "Analyse Directe",
                duration: 0,
                wipeOrKill: "Inconnu"
            };

            performanceStr = JSON.stringify(realPerformance);
            encounterStr = JSON.stringify(realEncounter);
        }
        // If WCL ONLY and no file
        else if (wclOnly && !geminiContext && reportCode) {
            const { fetchWCLReportDetails, fetchWCLFightData } = require("@/lib/wcl-api");
            const reportDetails = await fetchWCLReportDetails(reportCode);

            if (!reportDetails) {
                return NextResponse.json({ success: false, error: "Impossible de récupérer les détails du rapport WCL." }, { status: 404 });
            }

            // Construct a mini-performance object from WCL metadata for fallback
            const fights = reportDetails.fights || [];
            const lastFight = fights[fights.length - 1];

            // Try to fetch actual combat tables for the last fight
            let combatTable = null;
            if (lastFight) {
                combatTable = await fetchWCLFightData(reportCode, lastFight.id);
            }

            const targetPlayerName = charInfo?.charName || "Joueur Inconnu";
            const playerData = combatTable?.data?.entries?.find((e: any) =>
                e.name.toLowerCase() === targetPlayerName.toLowerCase()
            );

            const realPerformance = {
                playerName: targetPlayerName,
                playerClass: playerData?.type || "Warrior",
                playerSpec: playerData?.spec || "Inconnu",
                role: (playerData?.role || "DPS") as "DPS" | "Healer" | "Tank",
                dps: playerData?.total ? Math.round(playerData.total / (lastFight ? (lastFight.endTime - lastFight.startTime) / 1000 : 1)) : 0,
                totalDamage: playerData?.total || 0,
                totalHealing: 0,
                hps: 0,
                fightDuration: lastFight ? (lastFight.endTime - lastFight.startTime) / 1000 : 0,
                percentile: 0,
                avoidableDamageTaken: [],
                buffUptime: [],
                cooldownUsage: [],
                timeline: []
            };

            const realEncounter = {
                bossName: lastFight?.name || reportDetails.title,
                difficulty: lastFight?.keystoneLevel ? "Mythic+" : (lastFight?.difficulty === 4 ? "Heroic" : "Normal"),
                keystoneLevel: lastFight?.keystoneLevel,
                dungeonOrRaid: reportDetails.zone?.name || "Donjon inconnu",
                duration: realPerformance.fightDuration / 60,
                wipeOrKill: lastFight?.kill ? "Kill" : "Wipe"
            };

            // Enhanced Gemini Context for WCL-only
            geminiContext = `
                ANALYSE DIRECTE WARCRAFT LOGS (SANS FICHIER)
                Report: ${reportCode}
                Titre: ${reportDetails.title}
                Combat: ${realEncounter.bossName} (${realEncounter.difficulty}${realEncounter.keystoneLevel ? ' +' + realEncounter.keystoneLevel : ''})
                Résultat: ${realEncounter.wipeOrKill}
                
                DONNÉES PERFORMANCE DU JOUEUR (${targetPlayerName}) :
                - DPS: ${realPerformance.dps.toLocaleString()}
                - Total Dégâts: ${realPerformance.totalDamage.toLocaleString()}
                - Classe: ${realPerformance.playerClass}
            `;

            performanceStr = JSON.stringify(realPerformance);
            encounterStr = JSON.stringify(realEncounter);
        }

        if (!performanceStr && !wclOnly && !rawLog) {
            return NextResponse.json({ success: false, error: "Données d'analyse manquantes." }, { status: 400 });
        }

        const realPerformance = JSON.parse(performanceStr || "{}");
        const realEncounter = encounterStr ? JSON.parse(encounterStr) : {
            bossName: "Donjon",
            difficulty: "Mythic+",
            dungeonOrRaid: "Chargement...",
            duration: realPerformance.fightDuration || 0,
            wipeOrKill: "Kill"
        };

        // 🔍 Warcraft Logs Integration
        let wclRankings = null;
        let wclSummary = "Aucune donnée WCL trouvée.";
        if (charInfoStr) {
            const charInfo = JSON.parse(charInfoStr);
            console.log("[API] Fetching WCL rankings for:", charInfo);
            wclRankings = await fetchWCLRankings(
                charInfo.charName || realPerformance.playerName,
                slugifyServer(charInfo.server),
                charInfo.region
            );
            if (wclRankings && wclRankings.length > 0) {
                wclSummary = wclRankings
                    .slice(0, 5)
                    .map(r => `- ${r.encounterName}: Percentile ${r.percentile}% (${r.spec})`)
                    .join("\n");
            }
        }

        // --- UPTIME ANALYSIS SUMMARY ---
        const uptimeSummary = (realPerformance.buffUptime || [])
            .map((b: any) => `- ${b.buffName}: ${b.uptime}% (Cible: ${b.expectedUptime}%)`)
            .join("\n") || "Aucune donnée d'uptime buff détectée.";

        const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("[API] No Gemini API key found in environment variables.");
            return NextResponse.json({
                success: false,
                error: "Désolé, l'IA n'est pas configurée (Clé API manquante). Veuillez contacter l'administrateur."
            }, { status: 500 });
        }

        // Initialisation de Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
            },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        });

        const prompt = `
            Tu es un expert WoW. Voici un extrait brut de log de combat (ou des données de performance pré-analysées).
            Cible : Joueur ${realPerformance.playerName}.
            Contexte : ${realEncounter.dungeonOrRaid} (${realEncounter.difficulty}).

            MISSION :
            - Identifie la classe du joueur si non spécifiée (actuel: ${realPerformance.playerClass}).
            - Analyse sa rotation (priorités, séquences).
            - Identifie ses erreurs de placement ou mécaniques ratées.
            - Analyse rigoureusement l'UPTIME des buffs et debuffs fournis ci-dessous.
            - Donne des conseils ultra-spécifiques.
            
            IMPORTANT : Si c'est du Mythic+ (M+), la priorité absolue est la survie et l'utilitaire. 
            Mourir sur une mécanique de pack ou rater un kick crucial est BIEN PLUS GRAVE que de perdre 5% de DPS.
            L'IA doit être sévère sur les interrupts manqués et le positionnement.

            DONNÉES WCL HISTORIQUES DU JOUEUR :
            ${wclSummary}

            UPTIME DES SORTS CALCULÉ (LOGS ACTUELS) :
            ${uptimeSummary}

            Réponds UNIQUEMENT avec un objet JSON respectant ce schéma :
            {
              "summary": "Résumé de la performance",
              "strengths": ["Force 1", "Force 2", "Force 3"],
              "improvements": [{"area": "Domaine", "description": "Détails", "impact": "high", "priority": 1}],
              "overallGrade": "S | A | B | C",
              "actionPlan": [{"title": "Action", "description": "Détails concrets", "priority": 1, "category": "rotation | positioning | mechanics"}],
              "detailedAnalysis": "Analyse technique utilisant les données WCL historiques et les données de combat actuelles. Sois très précis sur les interrupts et les dégâts évitables."
            }

            DONNÉES DU COMBAT ACTUEL (LOGS EXTRAITS) :
            ${geminiContext}
        `;

        console.log("[API] Envoi à Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let textResult = response.text();

        // Nettoyage Markdown JSON si présent
        if (textResult.includes("```json")) {
            textResult = textResult.split("```json")[1].split("```")[0].trim();
        } else if (textResult.includes("```")) {
            textResult = textResult.split("```")[1].split("```")[0].trim();
        }

        if (!textResult) {
            throw new Error("Gemini n'a renvoyé aucun texte exploitable.");
        }

        const aiInsight = JSON.parse(textResult);

        return NextResponse.json({
            success: true,
            data: {
                performance: realPerformance,
                aiInsight: aiInsight,
                encounter: realEncounter,
                wclData: wclRankings,
                metadata: {
                    analyzedAt: new Date().toISOString(),
                    logVersion: "12.1",
                    eventsProcessed: 10000,
                    model: "Gemini 1.5 Flash"
                }
            }
        });

    } catch (error: any) {
        console.error("[API] Erreur Gemini (Fallback activé):", error);

        try {
            if (!performanceStr) throw new Error("Pas de données de performance");
            const realPerformance = JSON.parse(performanceStr);
            const realEncounter = encounterStr ? JSON.parse(encounterStr) : {
                bossName: "Donjon / Raid",
                difficulty: "Héroïque",
                dungeonOrRaid: "Analyse Locale",
                duration: realPerformance.fightDuration,
                wipeOrKill: "Kill"
            };
            const { generateLocalAnalysis } = require("@/lib/local-analyst");
            const localInsight = generateLocalAnalysis(realPerformance);

            return NextResponse.json({
                success: true,
                data: {
                    performance: realPerformance,
                    aiInsight: localInsight,
                    encounter: realEncounter,
                    metadata: {
                        analyzedAt: new Date().toISOString(),
                        logVersion: "12.1",
                        eventsProcessed: 10000,
                        model: "Offline Fallback",
                        error: error.message
                    }
                },
                notice: "L'IA Gemini est indisponible. Affichage de l'analyse locale de secours."
            });
        } catch (fallbackError) {
            return NextResponse.json({
                success: false,
                error: "Désolé, l'analyse a échoué.",
                details: error.message
            }, { status: 500 });
        }
    }
}
