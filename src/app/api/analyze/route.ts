// ============================================================
// API Route: /api/analyze
// Handles combat log upload and AI analysis via Google Gemini 1.5 Flash
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { calculateRealMetrics, validateCombatLog } from "@/lib/log-parser";
import { parseLogsForGemini } from "@/lib/parse-logs";
import { generateMockAnalysis } from "@/lib/mock-data";

export const maxDuration = 120; // 2 minutes timeout for Vercel

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const geminiContext = formData.get("geminiContext") as string | null;
        const performanceStr = formData.get("performance") as string | null;
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

        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                success: false,
                error: "Clé API Gemini manquante. Veuillez configurer GOOGLE_AI_API_KEY dans vos variables d'environnement Vercel.",
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
            // Disable safety filters for combat logs to avoid false positives (since logs contain "damage", "died", etc.)
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
            
            Réponds UNIQUEMENT avec un objet JSON respectant ce schéma :
            {
              "summary": "Résumé de la performance",
              "strengths": ["Force 1", "Force 2", "Force 3"],
              "improvements": [{"area": "Domaine", "description": "Détails", "impact": "high", "priority": 1}],
              "overallGrade": "S | A | B | C",
              "actionPlan": [{"title": "Action", "description": "Détails concrets", "priority": 1, "category": "rotation"}],
              "detailedAnalysis": "Analyse technique"
            }

            DONNÉES :
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
                encounter: {
                    bossName: "Donjon / Raid",
                    difficulty: "Héroïque",
                    dungeonOrRaid: "Analyse Réelle",
                    duration: realPerformance.fightDuration,
                    wipeOrKill: "Effectué",
                },
                metadata: {
                    analyzedAt: new Date().toISOString(),
                    logVersion: "12.1",
                    eventsProcessed: 10000,
                    model: "Gemini 1.5 Flash"
                }
            }
        });

    } catch (error: any) {
        console.error("[API] Erreur Gemini:", error);
        return NextResponse.json({
            success: false,
            error: "Erreur API Gemini",
            details: error.message,
            type: error.constructor.name
        }, { status: 500 });
    }
}
