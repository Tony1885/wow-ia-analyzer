"use client";

import React, { useState, useCallback, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";

import { Navbar } from "@/components/layout/navigation";
import { Dropzone } from "@/components/upload/dropzone";
import { ProcessingOverlay } from "@/components/upload/processing-overlay";
import { AIInsightCard } from "@/components/dashboard/ai-insight-card";
import {
    PerformanceMetrics,
    AvoidableDamageList,
    BuffUptimeList,
} from "@/components/dashboard/performance-metrics";
import { DpsTimelineChart } from "@/components/dashboard/dps-timeline-chart";
import { ActionPlan } from "@/components/dashboard/action-plan";
import { EncounterHeader } from "@/components/dashboard/encounter-header";
import { AnalysisResult, AnalysisState, UploadProgress } from "@/lib/types";

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
                    progress: Math.min(toProgress, fromProgress + increment * currentStep),
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
        async (file: File, anonymize: boolean) => {
            try {
                setError(null);

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
                // Start the API call AND the progress animation in PARALLEL
                setAnalysisState("analyzing");
                setProgress((prev) => ({
                    ...prev,
                    state: "analyzing",
                    progress: 55,
                    message: "Claude analyse tes performances...",
                    subMessage: "Intelligence artificielle en action 🧠",
                }));

                // Animate progress smoothly from 55% to 92% over 15 seconds
                // This runs independently — the API call won't block the animation
                startProgressAnimation(55, 92, 15000);

                // Launch the API call
                const formData = new FormData();
                formData.append("logFile", file);
                formData.append("anonymize", anonymize.toString());

                const response = await fetch("/api/analyze", {
                    method: "POST",
                    body: formData,
                });

                // Stop the independent animation
                stopProgressAnimation();

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Erreur serveur");
                }

                const data = await response.json();

                // Finalization (92→100%)
                setProgress({
                    state: "analyzing",
                    progress: 92,
                    message: "Finalisation de l'analyse...",
                    subMessage: "Génération du plan d'action",
                });
                startProgressAnimation(92, 100, 800);
                await new Promise((r) => setTimeout(r, 800));

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
                            <motion.div
                                key="results"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6 py-8"
                            >
                                {/* Top bar */}
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-white"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Nouvelle analyse
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-600">
                                            {result.metadata.eventsProcessed.toLocaleString()}{" "}
                                            événements analysés
                                        </span>
                                    </div>
                                </div>

                                {/* Encounter Header */}
                                <EncounterHeader
                                    encounter={result.encounter}
                                    performance={result.performance}
                                />

                                {/* Performance Metrics */}
                                <PerformanceMetrics performance={result.performance} />

                                {/* AI Insight + Timeline row */}
                                <div className="grid gap-6 lg:grid-cols-2">
                                    <AIInsightCard insight={result.aiInsight} />
                                    <DpsTimelineChart
                                        timeline={result.performance.timeline}
                                        averageDps={result.performance.dps}
                                    />
                                </div>

                                {/* Avoidable Damage + Buff Uptime */}
                                <div className="grid gap-6 lg:grid-cols-2">
                                    <AvoidableDamageList
                                        damages={result.performance.avoidableDamageTaken}
                                    />
                                    <BuffUptimeList
                                        buffs={result.performance.buffUptime}
                                    />
                                </div>

                                {/* Action Plan */}
                                <ActionPlan actions={result.aiInsight.actionPlan} />

                                {/* Bottom actions */}
                                <div className="flex justify-center gap-4 pt-8">
                                    <button
                                        onClick={handleReset}
                                        className="btn-glow flex items-center gap-2 text-sm"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Analyser un autre log
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </>
    );
}
