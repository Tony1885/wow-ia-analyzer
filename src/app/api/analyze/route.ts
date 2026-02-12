// ============================================================
// API Route: /api/analyze
// Handles combat log upload and AI analysis via Google Gemini 1.5 Flash
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateRealMetrics, validateCombatLog } from "@/lib/log-parser";
import { parseLogsForGemini } from "@/lib/parse-logs";
import { generateMockAnalysis } from "@/lib/mock-data";

export const maxDuration = 120; // 2 minutes timeout for Vercel

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("logFile") as File | null;
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

        if (!file) {
            return NextResponse.json({ success: false, error: "Aucun fichier fourni." }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                success: false,
                error: "Clé API Gemini manquante. Veuillez configurer GOOGLE_AI_API_KEY dans vos variables d'environnement Vercel.",
            }, { status: 500 });
        }

        // Lecture et validation
        const content = await file.text();
        const validation = validateCombatLog(content);
        if (!validation.valid) {
            return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
        }

        // Parsing des métriques réelles (DPS, Healing, noms, etc.)
        const events = require("@/lib/log-parser").parseCombatLog(content);
        const realPerformance = calculateRealMetrics(events);

        // Préparation du log pour Gemini (Filtrage intelligent + Limite 5000 lignes)
        console.log("[API] Optimisation du log pour Gemini...");
        const geminiContext = parseLogsForGemini(content);

        // Initialisation de Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
            Tu es un coach expert de World of Warcraft Retail. Analyse ces événements de combat. 
            Réponds uniquement au format JSON pur en suivant ce schéma :
            {
              "summary": "Résumé narratif de la performance (3 phrases)",
              "strengths": ["Liste de 3 points forts"],
              "improvements": [
                { "area": "Domaine", "description": "Détails", "impact": "high", "priority": 1 }
              ],
              "overallGrade": "S | A | B | C | D",
              "actionPlan": [
                { "title": "Action", "description": "Détails concrets", "priority": 1, "category": "rotation" }
              ],
              "detailedAnalysis": "Analyse technique approfondie"
            }

            DONNÉES DE COMBAT (RAW) :
            ${geminiContext}

            IMPORTANT : Focalise-toi sur le joueur ${realPerformance.playerName} (${realPerformance.playerClass} ${realPerformance.playerSpec}).
        `;

        console.log("[API] Envoi à Gemini 1.5 Flash...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResult = response.text();
        const aiInsight = JSON.parse(textResult);

        // Retourner le résultat final
        return NextResponse.json({
            success: true,
            data: {
                performance: realPerformance,
                aiInsight: aiInsight,
                encounter: {
                    bossName: "Combat de Log",
                    difficulty: "Héroïque",
                    dungeonOrRaid: "Analyse Réelle",
                    duration: realPerformance.fightDuration,
                    wipeOrKill: "Effectué",
                },
                metadata: {
                    analyzedAt: new Date().toISOString(),
                    logVersion: "12.1",
                    eventsProcessed: events.length,
                    model: "Gemini 1.5 Flash"
                }
            }
        });

    } catch (error: any) {
        console.error("[API] Erreur d'analyse Gemini:", error);
        return NextResponse.json({
            success: false,
            error: "Une erreur est survenue lors de l'analyse avec Gemini. Vérifiez votre clé API ou la taille du log.",
            details: error.message
        }, { status: 500 });
    }
}
