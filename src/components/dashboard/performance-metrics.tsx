"use client";

import React from "react";
import { motion } from "framer-motion";
import { Swords, Heart, Clock, Percent, Shield, Flame } from "lucide-react";
import { PlayerPerformance } from "@/lib/types";
import { formatNumber, formatPercentage, getColorForPercentage, getRankLabel } from "@/lib/utils";

interface PerformanceMetricsProps {
    performance: PlayerPerformance;
}

export function PerformanceMetrics({ performance }: PerformanceMetricsProps) {
    const metrics = [
        {
            label: "DPS",
            value: formatNumber(performance.dps),
            icon: <Swords className="h-5 w-5" />,
            color: "text-danger-400",
            bgColor: "from-danger-500/10 to-danger-600/5",
            ringColor: "ring-danger-500/20",
        },
        {
            label: "HPS",
            value: formatNumber(performance.hps),
            icon: <Heart className="h-5 w-5" />,
            color: "text-healing-400",
            bgColor: "from-healing-500/10 to-healing-600/5",
            ringColor: "ring-healing-500/20",
        },
        {
            label: "Durée",
            value: `${Math.floor((performance.fightDuration || 0) / 60)}:${(
                (performance.fightDuration || 0) % 60
            )
                .toFixed(0)
                .padStart(2, "0")}`,
            icon: <Clock className="h-5 w-5" />,
            color: "text-mana-400",
            bgColor: "from-mana-500/10 to-mana-600/5",
            ringColor: "ring-mana-500/20",
        },
        {
            label: "Percentile",
            value: `${performance.percentile}`,
            suffix: "th",
            icon: <Percent className="h-5 w-5" />,
            color: `text-[${getColorForPercentage(performance.percentile)}]`,
            bgColor: "from-epic-500/10 to-legendary-500/5",
            ringColor: "ring-epic-500/20",
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, i) => (
                <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="glass-card-hover p-5"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                            {metric.label}
                        </span>
                        <div
                            className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${metric.bgColor} ring-1 ${metric.ringColor}`}
                        >
                            <span className={metric.color}>{metric.icon}</span>
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="font-display text-3xl font-black text-white">
                            {metric.value}
                        </span>
                        {metric.suffix && (
                            <span className="ml-0.5 text-lg text-gray-500">
                                {metric.suffix}
                            </span>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

interface AvoidableDamageListProps {
    damages: PlayerPerformance["avoidableDamageTaken"];
}

export function AvoidableDamageList({ damages }: AvoidableDamageListProps) {
    if (damages.length === 0) {
        return (
            <div className="glass-card p-6 text-center">
                <Shield className="mx-auto h-8 w-8 text-healing-400" />
                <p className="mt-3 text-sm text-gray-400">
                    Aucun dégât évitable détecté. Bravo ! 🎉
                </p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card overflow-hidden"
        >
            <div className="flex items-center gap-3 border-b border-white/5 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-500/10 ring-1 ring-danger-500/20">
                    <Flame className="h-5 w-5 text-danger-400" />
                </div>
                <div>
                    <h3 className="font-display text-base font-bold text-white">
                        Dégâts évitables
                    </h3>
                    <p className="text-xs text-gray-500">
                        Mécaniques à améliorer
                    </p>
                </div>
            </div>

            <div className="divide-y divide-white/5">
                {damages.map((damage, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="p-5"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`h-2 w-2 rounded-full ${damage.severity === "critical"
                                        ? "bg-danger-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]"
                                        : damage.severity === "warning"
                                            ? "bg-legendary-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                                            : "bg-mana-400"
                                        }`}
                                />
                                <span className="font-medium text-white">
                                    {damage.abilityName}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="font-mono text-sm font-semibold text-danger-400">
                                    {formatNumber(damage.totalDamage)}
                                </span>
                                <span className="ml-2 text-xs text-gray-600">
                                    ({damage.hitCount} hit{damage.hitCount > 1 ? "s" : ""})
                                </span>
                            </div>
                        </div>
                        <p className="mt-2 pl-5 text-sm leading-relaxed text-gray-400">
                            💡 {damage.suggestion}
                        </p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

interface BuffUptimeListProps {
    buffs: PlayerPerformance["buffUptime"];
}

export function BuffUptimeList({ buffs }: BuffUptimeListProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card overflow-hidden"
        >
            <div className="flex items-center gap-3 border-b border-white/5 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-epic-500/10 ring-1 ring-epic-500/20">
                    <Percent className="h-5 w-5 text-epic-400" />
                </div>
                <div>
                    <h3 className="font-display text-base font-bold text-white">
                        Uptime des buffs
                    </h3>
                    <p className="text-xs text-gray-500">
                        Maintien des buffs critiques
                    </p>
                </div>
            </div>

            <div className="divide-y divide-white/5">
                {buffs.map((buff, i) => {
                    const isGood = buff.uptime >= buff.expectedUptime * 0.95;
                    const isOkay =
                        buff.uptime >= buff.expectedUptime * 0.8 && !isGood;

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.08 }}
                            className="px-5 py-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-300">
                                    {buff.buffName}
                                </span>
                                <span
                                    className={`font-mono text-sm font-semibold ${isGood
                                        ? "text-healing-400"
                                        : isOkay
                                            ? "text-legendary-400"
                                            : "text-danger-400"
                                        }`}
                                >
                                    {formatPercentage(buff.uptime)}
                                </span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-void-700">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${buff.uptime}%` }}
                                    transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                                    className={`h-full rounded-full ${isGood
                                        ? "bg-gradient-to-r from-healing-500 to-healing-400"
                                        : isOkay
                                            ? "bg-gradient-to-r from-legendary-500 to-legendary-400"
                                            : "bg-gradient-to-r from-danger-500 to-danger-400"
                                        }`}
                                />
                            </div>
                            <p className="mt-1 text-right text-[10px] text-gray-600">
                                Attendu : {formatPercentage(buff.expectedUptime)}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
