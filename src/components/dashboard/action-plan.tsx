"use client";

import React from "react";
import { motion } from "framer-motion";
import { Crosshair, RotateCw, MapPin, Disc, Wrench } from "lucide-react";
import { ActionItem } from "@/lib/types";

interface ActionPlanProps {
    actions: ActionItem[];
}

const categoryConfig: Record<
    string,
    { icon: React.ReactNode; color: string; bg: string }
> = {
    rotation: {
        icon: <RotateCw className="h-4 w-4" />,
        color: "text-epic-400",
        bg: "bg-epic-400/10 ring-epic-400/20",
    },
    positioning: {
        icon: <MapPin className="h-4 w-4" />,
        color: "text-mana-400",
        bg: "bg-mana-400/10 ring-mana-400/20",
    },
    cooldowns: {
        icon: <Disc className="h-4 w-4" />,
        color: "text-legendary-400",
        bg: "bg-legendary-400/10 ring-legendary-400/20",
    },
    mechanics: {
        icon: <Crosshair className="h-4 w-4" />,
        color: "text-danger-400",
        bg: "bg-danger-400/10 ring-danger-400/20",
    },
    gear: {
        icon: <Wrench className="h-4 w-4" />,
        color: "text-healing-400",
        bg: "bg-healing-400/10 ring-healing-400/20",
    },
};

const categoryLabels: Record<string, string> = {
    rotation: "Rotation",
    positioning: "Positionnement",
    cooldowns: "Cooldowns",
    mechanics: "Mécaniques",
    gear: "Équipement",
};

export function ActionPlan({ actions }: ActionPlanProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glass-card overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/5 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-legendary-400/10 ring-1 ring-legendary-400/20">
                    <Crosshair className="h-5 w-5 text-legendary-400" />
                </div>
                <div>
                    <h3 className="font-display text-base font-bold text-white">
                        Plan d&apos;action
                    </h3>
                    <p className="text-xs text-gray-500">
                        Top {actions?.length || 0} axes d&apos;amélioration pour le prochain run
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="divide-y divide-white/5">
                {actions.map((action, i) => {
                    const cat = categoryConfig[action.category] || categoryConfig.mechanics;

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + i * 0.15 }}
                            className="p-5"
                        >
                            <div className="flex items-start gap-4">
                                {/* Priority number */}
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-legendary-400/20 to-legendary-500/10 ring-1 ring-legendary-400/20">
                                    <span className="font-display text-lg font-black text-legendary-400">
                                        {i + 1}
                                    </span>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-sm font-semibold text-white">
                                            {action.title}
                                        </h4>
                                        <span
                                            className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium ring-1 ${cat.bg} ${cat.color}`}
                                        >
                                            {cat.icon}
                                            {categoryLabels[action.category] || action.category}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-relaxed text-gray-400">
                                        {action.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
