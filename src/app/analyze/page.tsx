"use client";

import React, { useState, useCallback, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";

import { Navbar } from "@/components/layout/navigation";
import { Dropzone } from "@/components/upload/dropzone";
import { ProcessingOverlay } from "@/components/upload/processing-overlay";
import { ActionPlan } from "@/components/dashboard/action-plan";
import { EncounterHeader } from "@/components/dashboard/encounter-header";
import { ResultsDashboard } from "@/components/dashboard/results-dashboard";
import { AnalysisResult, AnalysisState, UploadProgress } from "@/lib/types";
import { parseCombatLog, calculateRealMetrics, validateCombatLog } from "@/lib/log-parser";
import { parseLogsForGemini } from "@/lib/parse-logs";

export default function AnalyzePage() {
    return (
        <Suspense fallback={
            <>
                <Navbar />
                <main className="min-h-screen pt-24 pb-16">
                    <div className="mx-auto max-w-7xl px-6 py-16 text-center">
                        <div className="h-8 w-64 mx-auto rounded-lg bg-white/5 animate-pulse" />
                        <div className="mt-4 h-4 w-96 mx-auto rounded bg-white/5 animate-pulse" />
                    </div>
                </main>
            </>
        }>
            <AnalyzeContent />
        </Suspense>
    );
}

function AnalyzeContent() {
    const searchParams = useSearchParams();
    const isDemo = searchParams.get("demo") === "true";

    const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
    const [progress, setProgress] = useState<UploadProgress>({
        state: "idle",
        progress: 0,
        message: "",
    });
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-start demo mode
    useEffect(() => {
        if (isDemo && analysisState === "idle") {
            handleDemo();
        }
        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDemo]);

    // Smooth progress animation that runs independently of the API call
    const startProgressAnimation = useCallback(
        (fromProgress: number, toProgress: number, durationMs: number) => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            const steps = 60;
            const stepDuration = durationMs / steps;
            const increment = (toProgress - fromProgress) / steps;
            let currentStep = 0;

            progressIntervalRef.current = setInterval(() => {
                currentStep++;
                setProgress((prev) => ({
                    ...prev,
                    progress: Math.round(Math.min(toProgress, fromProgress + increment * currentStep)),
                }));
                if (currentStep >= steps) {
                    if (progressIntervalRef.current) {
                        clearInterval(progressIntervalRef.current);
                    }
                }
            }, stepDuration);
        },
        []
    );

    const stopProgressAnimation = useCallback(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    }, []);

    const handleFileAccepted = useCallback(
        async (file: File, anonymize: boolean, characterInfo?: { region: string, server: string, charName?: string }) => {
            try {
                setError(null);
                console.log("[WoWAnalyzer] Starting analysis for:", file.name, file.size, "bytes");

                // Stage 1: Upload (0→30%)
                setAnalysisState("uploading");
                setProgress({
                    state: "uploading",
                    progress: 0,
                    message: "Upload du log en cours...",
                    subMessage: `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} Mo)`,
                });
                startProgressAnimation(0, 30, 1500);
                await new Promise((r) => setTimeout(r, 1500));

                // Stage 2: Parsing (30→55%)
                setAnalysisState("parsing");
                setProgress((prev) => ({
                    ...prev,
                    state: "parsing",
                    message: "Parsing des événements de combat...",
                    subMessage: "Extraction des données pertinentes",
                }));
                startProgressAnimation(30, 55, 2000);
                await new Promise((r) => setTimeout(r, 2000));

                // Stage 3: AI Analysis (55→92%)
                setAnalysisState("analyzing");
                setProgress((prev) => ({
                    ...prev,
                    state: "analyzing",
                    progress: 55,
                    message: "Analyse du donjon M+ par Gemini 1.5 Flash...",
                    subMessage: "Patterns de combat et mécaniques en cours 🧠",
                }));

                // Animate progress from 55% to 92% while the API call runs
                // Increased to 40s to accommodate Gemini processing time
                startProgressAnimation(55, 92, 40000);

                // Launch the API call with a timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

                // Client-side Parsing (To avoid 413 Payload Too Large)
                const content = await file.text();
                const validation = validateCombatLog(content);
                if (!validation.valid) {
                    throw new Error(validation.error);
                }

                const events = parseCombatLog(content);
                const { performance, encounter } = calculateRealMetrics(events, characterInfo?.charName);
                const geminiContext = parseLogsForGemini(content);

                const formData = new FormData();
                formData.append("geminiContext", geminiContext);
                formData.append("performance", JSON.stringify(performance));
                formData.append("encounter", JSON.stringify(encounter));
                formData.append("anonymize", anonymize.toString());
                if (characterInfo) {
                    formData.append("characterInfo", JSON.stringify(characterInfo));
                }

                let response: Response;
                try {
                    response = await fetch("/api/analyze", {
                        method: "POST",
                        body: formData,
                        signal: controller.signal,
                    });
                } catch (fetchErr: any) {
                    clearTimeout(timeoutId);
                    stopProgressAnimation();
                    if (fetchErr?.name === "AbortError") {
                        throw new Error("L'analyse a pris trop de temps. Essayez avec un log plus petit (un seul boss).");
                    }
                    throw new Error("Impossible de contacter le serveur. Vérifiez que le serveur tourne.");
                }
                clearTimeout(timeoutId);
                stopProgressAnimation();

                console.log("[WoWAnalyzer] API response status:", response.status);

                // Handle error responses
                if (!response.ok) {
                    let errorMsg = "Erreur serveur";
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.error || errorMsg;
                    } catch {
                        errorMsg = `Erreur serveur(${response.status})`;
                    }
                    throw new Error(errorMsg);
                }

                // Parse response
                const data = await response.json();
                console.log("[WoWAnalyzer] API response received:", data.success, data.demo ? "(demo mode)" : "(real AI)");

                if (!data.success || !data.data) {
                    throw new Error("Réponse invalide du serveur. Veuillez réessayer.");
                }

                // Finalization (92→100%)
                setProgress({
                    state: "analyzing",
                    progress: 92,
                    message: "L'IA a terminé l'analyse !",
                    subMessage: "Génération du dashboard final...",
                });
                startProgressAnimation(92, 100, 1500);
                await new Promise((r) => setTimeout(r, 1500));
                stopProgressAnimation();

                setResult(data.data);

                // Complete
                setAnalysisState("complete");
                setProgress({
                    state: "complete",
                    progress: 100,
                    message: "Analyse terminée !",
                    subMessage: data.notice || "Tes résultats sont prêts",
                });

                await new Promise((r) => setTimeout(r, 500));
            } catch (err) {
                console.error("[WoWAnalyzer] Analysis failed:", err);
                stopProgressAnimation();
                setAnalysisState("error");
                setError(
                    err instanceof Error ? err.message : "Une erreur inattendue est survenue"
                );
            }
        },
        [startProgressAnimation, stopProgressAnimation]
    );

    const handleDemo = useCallback(async () => {
        try {
            setError(null);

            // Stage 1: Upload
            setAnalysisState("uploading");
            setProgress({
                state: "uploading",
                progress: 0,
                message: "Chargement du log de démonstration...",
                subMessage: "WoWCombatLog_Demo.txt",
            });
            startProgressAnimation(0, 30, 1000);
            await new Promise((r) => setTimeout(r, 1000));

            // Stage 2: Parsing
            setAnalysisState("parsing");
            setProgress((prev) => ({
                ...prev,
                state: "parsing",
                message: "Parsing des événements...",
                subMessage: "145 872 événements détectés",
            }));
            startProgressAnimation(30, 55, 1500);
            await new Promise((r) => setTimeout(r, 1500));

            // Stage 3: AI Analysis — parallel animation + API call
            setAnalysisState("analyzing");
            setProgress((prev) => ({
                ...prev,
                state: "analyzing",
                progress: 55,
                message: "Claude analyse le combat...",
                subMessage: "Gallywix — Mythique",
            }));
            startProgressAnimation(55, 92, 4000);

            // API call
            const response = await fetch("/api/analyze", {
                method: "POST",
                body: (() => {
                    const fd = new FormData();
                    fd.append("demo", "true");
                    return fd;
                })(),
            });

            stopProgressAnimation();
            const data = await response.json();

            // Finalization
            setProgress({
                state: "analyzing",
                progress: 92,
                message: "Finalisation...",
                subMessage: "Génération du rapport",
            });
            startProgressAnimation(92, 100, 600);
            await new Promise((r) => setTimeout(r, 600));

            stopProgressAnimation();
            setResult(data.data);

            setAnalysisState("complete");
            setProgress({
                state: "complete",
                progress: 100,
                message: "Analyse terminée !",
            });

            await new Promise((r) => setTimeout(r, 400));
        } catch (err) {
            stopProgressAnimation();
            setAnalysisState("error");
            setError("Erreur lors du chargement de la démo");
        }
    }, [startProgressAnimation, stopProgressAnimation]);

    const handleReset = useCallback(() => {
        stopProgressAnimation();
        setAnalysisState("idle");
        setResult(null);
        setError(null);
        setProgress({ state: "idle", progress: 0, message: "" });
    }, [stopProgressAnimation]);

    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-24 pb-16">
                <div className="mx-auto max-w-7xl px-6">
                    <AnimatePresence mode="wait">
                        {/* ===================== IDLE STATE ===================== */}
                        {analysisState === "idle" && !result && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="py-16"
                            >
                                <div className="text-center">
                                    <motion.h1
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="font-display text-4xl font-bold text-white sm:text-5xl"
                                    >
                                        Analyse ton{" "}
                                        <span className="text-gradient-epic">combat log</span>
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="mt-4 text-lg text-gray-400"
                                    >
                                        Upload ton fichier WoWCombatLog.txt pour obtenir tes
                                        conseils IA personnalisés.
                                    </motion.p>
                                </div>

                                <div className="mt-12">
                                    <Dropzone
                                        onFileAccepted={handleFileAccepted}
                                        isProcessing={false}
                                    />
                                </div>

                                {/* Demo mode shortcut */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-8 text-center"
                                >
                                    <button
                                        onClick={handleDemo}
                                        className="text-sm text-gray-500 underline decoration-gray-700 underline-offset-4 transition-colors hover:text-epic-400"
                                    >
                                        Pas de log sous la main ? Essayer avec un log de démo →
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* ===================== PROCESSING STATE ===================== */}
                        {(analysisState === "uploading" ||
                            analysisState === "parsing" ||
                            analysisState === "analyzing") &&
                            !result && (
                                <motion.div
                                    key="processing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex min-h-[60vh] items-center justify-center py-16"
                                >
                                    <ProcessingOverlay
                                        state={progress.state}
                                        progress={progress.progress}
                                        message={progress.message}
                                        subMessage={progress.subMessage}
                                    />
                                </motion.div>
                            )}

                        {/* ===================== ERROR STATE ===================== */}
                        {analysisState === "error" && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex min-h-[60vh] flex-col items-center justify-center py-16"
                            >
                                <div className="glass-card max-w-md p-8 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-500/10 ring-1 ring-danger-500/20">
                                        <span className="text-3xl">⚠️</span>
                                    </div>
                                    <h3 className="mt-5 font-display text-xl font-bold text-white">
                                        Erreur d&apos;analyse
                                    </h3>
                                    <p className="mt-3 text-sm text-gray-400">{error}</p>
                                    <button
                                        onClick={handleReset}
                                        className="btn-glow mt-6 !px-6 !py-3 text-sm"
                                    >
                                        <RotateCcw className="mr-2 inline h-4 w-4" />
                                        Réessayer
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ===================== RESULTS STATE ===================== */}
                        {result && analysisState === "complete" && (
                            <ResultsDashboard result={result} onReset={handleReset} />
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </>
    );
}
