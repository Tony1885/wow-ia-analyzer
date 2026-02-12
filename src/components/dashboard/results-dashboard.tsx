"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { AnalysisResult } from "@/lib/types";

import { EncounterHeader } from "./encounter-header";
import { PerformanceMetrics, AvoidableDamageList, BuffUptimeList } from "./performance-metrics";
import { AIInsightCard } from "./ai-insight-card";
import { DpsTimelineChart } from "./dps-timeline-chart";
import { ActionPlan } from "./action-plan";

interface ResultsDashboardProps {
    result: AnalysisResult;
    onReset: () => void;
}

export function ResultsDashboard({ result, onReset }: ResultsDashboardProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 py-8"
        >
            {/* Top bar */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Nouvelle analyse
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600">
                        {result.metadata.eventsProcessed.toLocaleString()} événements analysés
                    </span>
                    <span className="rounded-full bg-epic-500/10 px-2 py-0.5 text-[10px] font-medium text-epic-400 ring-1 ring-epic-500/20">
                        {result.metadata.model || "Gemini 1.5 Flash"}
                    </span>
                </div>
            </div>

            {/* Encounter Header with Epic Entrance */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <EncounterHeader encounter={result.encounter} performance={result.performance} />
            </motion.div>

            {/* Performance Metrics - Loot Drop Effect */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <PerformanceMetrics performance={result.performance} />
            </motion.div>

            {/* AI Insight + Timeline row */}
            <div className="grid gap-6 lg:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <AIInsightCard insight={result.aiInsight} />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <DpsTimelineChart
                        timeline={result.performance.timeline}
                        averageDps={result.performance.dps}
                    />
                </motion.div>
            </div>

            {/* Avoidable Damage + Buff Uptime */}
            <div className="grid gap-6 lg:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <AvoidableDamageList damages={result.performance.avoidableDamageTaken} />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <BuffUptimeList buffs={result.performance.buffUptime} />
                </motion.div>
            </div>

            {/* Action Plan - "Epic Loot" Appearance */}
            <motion.div
                initial={{ opacity: 0, filter: "brightness(2) blur(10px)" }}
                animate={{ opacity: 1, filter: "brightness(1) blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="relative"
            >
                <div className="absolute -left-4 -top-4 -z-10 h-24 w-24 animate-pulse rounded-full bg-legendary-500/10 blur-2xl" />
                <div className="flex items-center gap-2 mb-4 text-legendary-400">
                    <Sparkles className="h-5 w-5 animate-spin-slow" />
                    <h3 className="font-display text-lg font-bold uppercase tracking-wider">Plan d&apos;Action Légendaire</h3>
                </div>
                <ActionPlan actions={result.aiInsight.actionPlan} />
            </motion.div>

            {/* Bottom actions */}
            <div className="flex justify-center gap-4 pt-8">
                <button
                    onClick={onReset}
                    className="btn-glow flex items-center gap-2 text-sm"
                >
                    <RotateCcw className="h-4 w-4" />
                    Analyser un autre log
                </button>
            </div>
        </motion.div>
    );
}
