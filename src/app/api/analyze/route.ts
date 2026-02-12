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
        const geminiContext = formData.get("geminiContext") as string | null;
        performanceStr = formData.get("performance") as string || "";
        encounterStr = formData.get("encounter") as string || "";
        const charInfoStr = formData.get("characterInfo") as string | null;
        const anonymize = formData.get("anonymize") === "true";
        const demoMode = formData.get("demo") === "true";

        // Mode démo - retour immédiat de données simulées
        if (demoMode) {
            return NextResponse.json({
                success: true,
                data: generateMockAnalysis(),
                notice: "Mode démo activé",
            });
        }

        if (!geminiContext || !performanceStr) {
            return NextResponse.json({ success: false, error: "Données d'analyse manquantes." }, { status: 400 });
        }

        const realPerformance = JSON.parse(performanceStr);
        const realEncounter = encounterStr ? JSON.parse(encounterStr) : {
            bossName: "Plusieurs Boss",
            difficulty: "Héroïque",
            dungeonOrRaid: "Analyse en cours",
            duration: realPerformance.fightDuration,
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

        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Clé API Gemini manquante.");
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
            Tu es un coach expert de World of Warcraft Retail (analyste de logs).
            Analyse les données de combat fournies pour le joueur ${realPerformance.playerName}.
            Contexte : ${realEncounter.dungeonOrRaid} (${realEncounter.difficulty}).
            
            DONNÉES WCL HISTORIQUES DU JOUEUR :
            ${wclSummary}

            Réponds UNIQUEMENT avec un objet JSON respectant ce schéma :
            {
              "summary": "Résumé de la performance",
              "strengths": ["Force 1", "Force 2", "Force 3"],
              "improvements": [{"area": "Domaine", "description": "Détails", "impact": "high", "priority": 1}],
              "overallGrade": "S | A | B | C",
              "actionPlan": [{"title": "Action", "description": "Détails concrets", "priority": 1, "category": "rotation"}],
              "detailedAnalysis": "Analyse technique utilisant les données WCL historiques pour situer le joueur"
            }

            DONNÉES DU COMBAT ACTUEL :
            ${geminiContext}
        `;

        console.log("[API] Envoi à Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResult = response.text();

        if (!textResult) {
            throw new Error("Gemini n'a renvoyé aucun texte. Vérifiez les filtres de sécurité.");
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
