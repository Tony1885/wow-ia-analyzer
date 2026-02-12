"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Trophy, BarChart3 } from "lucide-react";

interface WCLRanking {
    encounterId: number;
    encounterName: string;
    rank: number;
    outOf: number;
    percentile: number;
    amount: number;
    spec: string;
}

interface WCLRankingsProps {
    rankings: WCLRanking[];
}

export function WCLRankingsCard({ rankings }: WCLRankingsProps) {
    if (!rankings || rankings.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden"
        >
            <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-4">
                <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-epic-400" />
                    <h3 className="font-display font-bold uppercase tracking-wider text-white">
                        Rankings Warcraft Logs
                    </h3>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-epic-500/10 px-3 py-1 text-[10px] font-bold text-epic-400 ring-1 ring-epic-500/20">
                    HISTORIQUE
                </div>
            </div>

            <div className="divide-y divide-white/5">
                {rankings.map((rank, i) => (
                    <div
                        key={i}
                        className="group flex items-center justify-between p-4 transition-colors hover:bg-white/[0.02]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-void-800 ring-1 ring-white/10">
                                <span className="text-xs font-bold text-gray-400">#{rank.rank}</span>
                            </div>
                            <div>
                                <p className="font-medium text-white">{rank.encounterName}</p>
                                <p className="text-xs text-gray-500">{rank.spec}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-sm font-bold text-epic-400">{rank.percentile}%</p>
                                <p className="text-[10px] uppercase tracking-tighter text-gray-500">Percentile</p>
                            </div>
                            <div className="text-right sm:block hidden">
                                <p className="text-sm font-bold text-white">{(rank.amount ? rank.amount / 1000 : 0).toFixed(1)}k</p>
                                <p className="text-[10px] uppercase tracking-tighter text-gray-500">Amount</p>
                            </div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-colors group-hover:bg-epic-500/20">
                                <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-epic-400" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-void-900/50 p-3 text-center">
                <p className="text-[10px] text-gray-600">
                    Données récupérées via l&apos;API Warcraft Logs v2
                </p>
            </div>
        </motion.div>
    );
}
