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

        if (!apiKey) {
            console.error("[Chat API] CRITICAL: GOOGLE_AI_API_KEY is not defined");
            return NextResponse.json({
                error: "Désolé, l'IA n'est pas configurée.",
                details: "La clé API 'GOOGLE_AI_API_KEY' est manquante sur Vercel. Pense à redéployer après l'avoir ajoutée."
            }, { status: 500 });
        }

        const systemPrompt = SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.build;

        const genAI = new GoogleGenerativeAI(apiKey);

        // Use gemini-1.5-flash-latest which is often more stable across regions
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
        });

        // Simplified combined prompt to avoid systemInstruction blocks that can be region-sensitive
        const prompt = `INSTRUCTIONS SYSTÈME: ${systemPrompt}\n\nREQUÊTE UTILISATEUR: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

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
        } else if (technicalDetails.includes("supported")) {
            technicalDetails = `La région Vercel [${region}] est bloquée par Google. Change la région des 'Functions' en Washington (iad1) ou San Francisco (sfo1) dans les réglages Vercel et REDÉPLOIE.`;
        }

        return NextResponse.json({
            error: "Erreur lors de la réponse de l'IA.",
            details: technicalDetails
        }, { status: 500 });
    }
}
