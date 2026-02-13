import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPTS } from "@/lib/constants";

export const maxDuration = 60; // 1 minute timeout for Vercel

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, mode } = body;

        console.log(`[Chat API] Start - Mode: ${mode}`);


        const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
        // Ensure API key is present for deployment

        if (!apiKey) {
            console.error("[Chat API] CRITICAL: GOOGLE_AI_API_KEY is not defined");
            return NextResponse.json({
                error: "Désolé, l'IA n'est pas configurée.",
                details: "La clé API 'GOOGLE_AI_API_KEY' est manquante sur Vercel. Pense à redéployer après l'avoir ajoutée."
            }, { status: 500 });
        }

        const systemPrompt = SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.build;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        if (message.includes("warcraftlogs.com/reports/")) {
            console.log("[Chat API] Analyzing WCL Log...");
            const logMatch = message.match(/reports\/([a-zA-Z0-9]+)(?:#.*fight=([0-9]+))?(?:.*source=([0-9]+))?/);
            const code = logMatch?.[1];
            const fightId = logMatch?.[2] ? parseInt(logMatch[2]) : undefined;
            const sourceId = logMatch?.[3] ? parseInt(logMatch[3]) : undefined;

            if (code && fightId) {
                const { getLogPerformance } = require("@/lib/wcl-api");
                const logData = await getLogPerformance(code, fightId, sourceId);

                if (logData) {
                    const analysisPrompt = `
                    Tu es un expert WoW Analysis. Analyse ces données de logs brutes (Talents, Gear, Casts) pour identifier les erreurs.
                    
                    Données du combat (Extrait JSON): 
                    ${JSON.stringify(logData).substring(0, 50000)}

                    RÈGLES D'ANALYSE :
                    1. Talents : Sont-ils cohérents pour ce type de combat ?
                    2. Gear : Bijoux/Gemmes optimisés ?
                    3. Rotation : Analyse la timeline des casts pour voir les erreurs de cycle.

                    FORMAT DE RÉPONSE ATTENDU (JSON STRICT, pas de markdown, pas de code block) :
                    {
                        "summary": "Résumé global de la performance en 2 phrases html autorise.",
                        "talents": { "status": "success" | "warning" | "error", "title": "Analyse des Talents", "content": "Détails..." },
                        "gear": { "status": "success" | "warning" | "error", "title": "Analyse du Stuff", "content": "Détails..." },
                        "rotation": { "status": "success" | "warning" | "error", "title": "Analyse de la Rotation", "content": "Détails..." }
                    }`;

                    const result = await model.generateContent(analysisPrompt);
                    const response = await result.response;
                    let text = response.text();

                    // Cleanup wrappers if AI adds them
                    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

                    try {
                        // Validate JSON
                        JSON.parse(text);
                        return NextResponse.json({ text, type: "json" });
                    } catch (e) {
                        console.error("AI returned invalid JSON", text);
                        // Fallback to text
                        return NextResponse.json({ text });
                    }
                }
            }
        }

        // Standard Chat / Build Analysis
        const prompt = `INSTRUCTIONS SYSTÈME: ${systemPrompt}\n\nREQUÊTE UTILISATEUR: ${message}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return NextResponse.json({ text });

        if (!text) {
            throw new Error("L'IA a retourné une réponse vide.");
        }

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error("[Chat API] Error:", error.message);

        let technicalDetails = error.message;
        const region = process.env.VERCEL_REGION || "local";

        if (technicalDetails.includes("API key not valid")) {
            technicalDetails = "Clé API invalide. Vérifie-la dans Google AI Studio.";
        } else if (technicalDetails.includes("supported") || technicalDetails.includes("location") || technicalDetails.includes("403")) {
            // This error usually means "User location is not supported"
            if (region === "local") {
                technicalDetails = `Ton IP locale est bloquée par Google. (Erreur originale: ${error.message})`;
            } else {
                technicalDetails = `La région Vercel [${region}] semble bloquée. Google dit: ${error.message}`;
            }
        }

        return NextResponse.json({
            error: "Erreur IA (Google)",
            details: technicalDetails
        }, { status: 500 });
    }
}
