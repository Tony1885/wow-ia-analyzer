// ============================================================
// API Route: /api/analyze
// Handles combat log upload and AI analysis
// Primary: Claude Sonnet 4 | Fallback: OpenAI GPT-4o
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { parseCombatLog, summarizeForAI, validateCombatLog, anonymizeNames } from "@/lib/log-parser";
import { SYSTEM_PROMPT, buildAnalysisPrompt } from "@/lib/ai-prompts";
import { generateMockAnalysis } from "@/lib/mock-data";

export const maxDuration = 120; // seconds — AI analysis can take time on large logs

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("logFile") as File | null;
        const anonymize = formData.get("anonymize") === "true";
        const playerClass = formData.get("playerClass") as string | null;
        const playerSpec = formData.get("playerSpec") as string | null;
        const demoMode = formData.get("demo") === "true";

        // Demo mode - return mock data
        if (demoMode) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return NextResponse.json({
                success: true,
                data: generateMockAnalysis(),
                demo: true,
                notice: "Mode démo — Données simulées pour Gallywix Mythique",
            });
        }

        if (!file) {
            return NextResponse.json(
                { success: false, error: "Aucun fichier fourni." },
                { status: 400 }
            );
        }

        // Validate file type
        const validExtensions = [".txt", ".log", ".csv"];
        const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
        if (!hasValidExt) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Format de fichier non supporté. Utilisez un fichier .txt, .log ou .csv (WoWCombatLog).",
                },
                { status: 400 }
            );
        }

        // Check file size (max 150MB — WoW logs can be large)
        if (file.size > 150 * 1024 * 1024) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Le fichier est trop volumineux (max 150 Mo). Essayez avec un log d'un seul boss.",
                },
                { status: 400 }
            );
        }

        // Read file content
        const content = await file.text();

        // Validate combat log format
        const validation = validateCombatLog(content);
        if (!validation.valid) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        // Parse combat log
        let events = parseCombatLog(content);

        // Anonymize if requested
        if (anonymize) {
            events = anonymizeNames(events);
        }

        // Summarize for AI (token optimization)
        const logSummary = summarizeForAI(events);

        // Check if AI API key is configured
        // Priority: Anthropic Claude (primary) > OpenAI (fallback)
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;

        if (!anthropicKey && !openaiKey) {
            // Fallback to mock when no AI configured
            console.log("[WoWAnalyzer] No AI API key configured — returning mock analysis");
            console.log(`[WoWAnalyzer] Parsed ${events.length} events from ${file.name}`);
            return NextResponse.json({
                success: true,
                data: generateMockAnalysis(),
                demo: true,
                notice: "Mode démo : Aucune clé API IA configurée. Ajoutez ANTHROPIC_API_KEY dans .env.local pour l'analyse réelle.",
            });
        }

        // Call AI API — Claude Sonnet 4 is primary
        let aiResponse: string;
        let modelUsed: string;

        if (anthropicKey) {
            modelUsed = "Claude Sonnet 4";
            aiResponse = await callAnthropic(anthropicKey, logSummary, playerClass, playerSpec);
        } else {
            modelUsed = "GPT-4o";
            aiResponse = await callOpenAI(openaiKey!, logSummary, playerClass, playerSpec);
        }

        // Parse AI response
        const aiInsight = JSON.parse(aiResponse);

        // Build full analysis result
        const result = {
            ...generateMockAnalysis(), // Use structure from mock
            aiInsight, // Override with real AI insights
            metadata: {
                analyzedAt: new Date().toISOString(),
                logVersion: "12.1",
                eventsProcessed: events.length,
                anonymized: anonymize,
            },
        };

        return NextResponse.json({
            success: true,
            data: result,
            model: modelUsed,
        });
    } catch (error) {
        console.error("[WoWAnalyzer] Analysis error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Une erreur est survenue lors de l'analyse. Veuillez réessayer.",
            },
            { status: 500 }
        );
    }
}

// ============================================================
// Anthropic Claude Sonnet 4 — PRIMARY ENGINE
// ============================================================
async function callAnthropic(
    apiKey: string,
    logSummary: string,
    playerClass?: string | null,
    playerSpec?: string | null
): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 8000,
            temperature: 0.2,
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: "user",
                    content: buildAnalysisPrompt(
                        logSummary,
                        playerClass || undefined,
                        playerSpec || undefined
                    ),
                },
            ],
        }),
    });

    if (!response.ok) {
        const errData = await response.json();
        console.error("[WoWAnalyzer] Anthropic API error:", errData);
        throw new Error(`Claude API error: ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.content[0].text;

    // Extract JSON from response (Claude sometimes wraps in markdown code blocks)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    return jsonMatch ? jsonMatch[1].trim() : text;
}

// ============================================================
// OpenAI GPT-4o — FALLBACK ENGINE
// ============================================================
async function callOpenAI(
    apiKey: string,
    logSummary: string,
    playerClass?: string | null,
    playerSpec?: string | null
): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: buildAnalysisPrompt(
                        logSummary,
                        playerClass || undefined,
                        playerSpec || undefined
                    ),
                },
            ],
            temperature: 0.3,
            max_tokens: 8000,
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const errData = await response.json();
        console.error("[WoWAnalyzer] OpenAI API error:", errData);
        throw new Error(`OpenAI API error: ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
