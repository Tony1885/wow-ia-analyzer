"use client"

import React from "react"
import { motion } from "framer-motion"
import { MessageSquare, LayoutGrid, Zap, BarChart3, ChevronRight } from "lucide-react"
import { MODULE_CARDS } from "@/lib/constants"
import { cn } from "@/lib/utils"

const iconMap = {
    MessageSquare,
    LayoutGrid,
    Zap,
    BarChart3
}

interface DashboardGridProps {
    onModuleSelect: (id: string) => void
}

export function DashboardGrid({ onModuleSelect }: DashboardGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MODULE_CARDS.map((card, i) => {
                const Icon = iconMap[card.icon as keyof typeof iconMap]

                return (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => !card.comingSoon && onModuleSelect(card.id)}
                        className={cn(
                            "group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-6 transition-all duration-300",
                            card.comingSoon ? "opacity-60 grayscale cursor-not-allowed" : "cursor-pointer hover:border-white/20 hover:bg-slate-800/50 hover:shadow-2xl hover:shadow-violet-500/10"
                        )}
                    >
                        {/* Gradient Background */}
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-br transition-opacity duration-300 opacity-0 group-hover:opacity-100",
                            card.color
                        )} />

                        <div className="relative z-10 space-y-4">
                            <div className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300",
                                card.accent
                            )}>
                                <Icon size={24} />
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg text-white">{card.title}</h3>
                                    {card.comingSoon && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-400 uppercase tracking-tighter">Bientôt</span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-slate-400 line-clamp-2">{card.description}</p>
                            </div>

                            {!card.comingSoon && (
                                <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-[-10px] group-hover:translate-x-0">
                                    <span className={card.accent}>Lancer</span>
                                    <ChevronRight size={14} className={card.accent} />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
