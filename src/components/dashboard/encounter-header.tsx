"use client";

import React from "react";
import { motion } from "framer-motion";
import { EncounterInfo, PlayerPerformance } from "@/lib/types";
import { CLASS_DATA } from "@/lib/class-data";
import { Trophy, Skull, Shield, Clock } from "lucide-react";

interface EncounterHeaderProps {
    encounter: EncounterInfo;
    performance: PlayerPerformance;
}

const difficultyColors: Record<string, string> = {
    Normal: "text-healing-400 bg-healing-400/10 ring-healing-400/20",
    Heroic: "text-epic-400 bg-epic-400/10 ring-epic-400/20",
    Mythic: "text-legendary-400 bg-legendary-400/10 ring-legendary-400/20",
    "Mythic+": "text-legendary-400 bg-legendary-400/10 ring-legendary-400/20",
};

export function EncounterHeader({
    encounter,
    performance,
}: EncounterHeaderProps) {
    const classInfo = CLASS_DATA[performance.playerClass];
    const duration = encounter.duration || 0;
    const mins = Math.floor(duration / 60);
    const secs = Math.floor(duration % 60);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card overflow-hidden"
        >
            {/* Gradient accent line */}
            <div className="h-1 bg-gradient-to-r from-epic-500 via-mana-500 to-legendary-400" />

            <div className="p-6">
                <div className="flex flex-wrap items-center gap-6">
                    {/* Boss info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            {encounter.wipeOrKill === "Kill" ? (
                                <Trophy className="h-6 w-6 text-legendary-400" />
                            ) : (
                                <Skull className="h-6 w-6 text-danger-400" />
                            )}
                            <div>
                                <h2 className="font-display text-xl font-bold text-white">
                                    {encounter.bossName}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {encounter.dungeonOrRaid}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Difficulty */}
                        <span
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 ${difficultyColors[encounter.difficulty] ||
                                difficultyColors.Normal
                                }`}
                        >
                            {encounter.difficulty}
                            {encounter.keystoneLevel
                                ? ` +${encounter.keystoneLevel}`
                                : ""}
                        </span>

                        {/* Kill / Wipe */}
                        <span
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 ${encounter.wipeOrKill === "Kill"
                                ? "bg-healing-400/10 text-healing-400 ring-healing-400/20"
                                : "bg-danger-400/10 text-danger-400 ring-danger-400/20"
                                }`}
                        >
                            {encounter.wipeOrKill === "Kill" ? "✓ Kill" : "✗ Wipe"}
                        </span>

                        {/* Duration */}
                        <span className="flex items-center gap-1.5 rounded-lg bg-void-700/50 px-3 py-1.5 text-xs font-medium text-gray-400 ring-1 ring-white/5">
                            <Clock className="h-3 w-3" />
                            {mins}:{secs.toString().padStart(2, "0")}
                        </span>

                        {/* Player class */}
                        <span
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 ring-white/10"
                            style={{ color: classInfo?.colorHex || "#fff" }}
                        >
                            <span>{classInfo?.icon || "⚔️"}</span>
                            {performance.playerSpec} {performance.playerClass}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
