"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, Target, TrendingUp } from "lucide-react";
import { AIInsight } from "@/lib/types";

interface AIInsightCardProps {
    insight: AIInsight;
}

const gradeConfig: Record<string, { color: string; bg: string; glow: string; label: string }> = {
    S: {
        color: "text-legendary-400",
        bg: "bg-legendary-400/10",
        glow: "shadow-glow-gold",
        label: "Légendaire",
    },
    A: {
        color: "text-epic-400",
        bg: "bg-epic-400/10",
        glow: "shadow-glow",
        label: "Épique",
    },
    B: {
        color: "text-mana-400",
        bg: "bg-mana-400/10",
        glow: "",
        label: "Rare",
    },
    C: {
        color: "text-healing-400",
        bg: "bg-healing-400/10",
        glow: "",
        label: "Standard",
    },
    D: {
        color: "text-gray-400",
        bg: "bg-gray-400/10",
        glow: "",
        label: "Faible",
    },
    F: {
        color: "text-danger-400",
        bg: "bg-danger-400/10",
        glow: "",
        label: "Critique",
    },
};

export function AIInsightCard({ insight }: AIInsightCardProps) {
    const grade = gradeConfig[insight.overallGrade] || gradeConfig.C;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-start gap-4 p-6 pb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-epic-500/20 to-mana-500/20 ring-1 ring-epic-500/20">
                    <Brain className="h-6 w-6 text-epic-400" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-bold text-white">
                            Analyse IA
                        </h3>
                        <div
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 ${grade.bg} ${grade.glow}`}
                        >
                            <span className={`font-display text-2xl font-black ${grade.color}`}>
                                {insight.overallGrade}
                            </span>
                            <span className={`text-xs font-medium ${grade.color}`}>
                                {grade.label}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Summary - the narrative */}
            <div className="border-t border-white/5 px-6 py-5">
                <div className="relative rounded-xl bg-gradient-to-r from-epic-500/5 to-mana-500/5 p-5 ring-1 ring-white/5">
                    <Sparkles className="absolute right-4 top-4 h-4 w-4 text-epic-500/30" />
                    <p className="text-sm leading-relaxed text-gray-300">
                        &ldquo;{insight.summary || "Analyse en attente..."}&rdquo;
                    </p>
                </div>
            </div>

            {/* Strengths */}
            <div className="border-t border-white/5 px-6 py-5">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-healing-400">
                    <TrendingUp className="h-4 w-4" />
                    Points forts
                </h4>
                <div className="space-y-2">
                    {(insight.strengths || []).map((strength, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="flex items-start gap-3 rounded-lg bg-healing-500/5 px-3 py-2"
                        >
                            <span className="mt-0.5 text-healing-400">✓</span>
                            <span className="text-sm text-gray-300">{strength}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Improvements */}
            <div className="border-t border-white/5 px-6 py-5">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-legendary-400">
                    <Target className="h-4 w-4" />
                    Axes d&apos;amélioration
                </h4>
                <div className="space-y-3">
                    {(insight.improvements || []).map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="rounded-xl bg-white/[0.02] p-4 ring-1 ring-white/5"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-white">
                                    {item.area}
                                </span>
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${item.impact === "high"
                                        ? "bg-danger-500/10 text-danger-400"
                                        : item.impact === "medium"
                                            ? "bg-legendary-400/10 text-legendary-400"
                                            : "bg-mana-400/10 text-mana-400"
                                        }`}
                                >
                                    Impact {item.impact === "high" ? "élevé" : item.impact === "medium" ? "moyen" : "faible"}
                                </span>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-gray-400">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Detailed analysis */}
            <div className="border-t border-white/5 px-6 py-5">
                <p className="text-xs leading-relaxed text-gray-500">
                    {insight.detailedAnalysis}
                </p>
            </div>
        </motion.div>
    );
}
