"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowLeft } from "lucide-react"
import { DashboardGrid } from "@/components/modules/DashboardGrid"
import { CoachModule } from "@/components/modules/CoachModule"
import { BuildModule } from "@/components/modules/BuildModule"
import { ForgeModule } from "@/components/modules/ForgeModule"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [activeModule, setActiveModule] = useState<string | null>(null)

  return (
    <div className="relative min-h-screen pt-24 pb-12 px-4 md:px-8 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!activeModule ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              {/* Hero Section */}
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-xs font-bold uppercase tracking-widest"
                >
                  <Sparkles size={14} />
                  L'IA au service de la victoire
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
                  Maîtrise le Nexus de <br />
                  <span className="bg-gradient-to-r from-violet-400 via-violet-500 to-amber-500 bg-clip-text text-transparent">
                    Warcraft avec l'IA
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                  Trois outils, une seule interface pour dominer tes clés Mythic+ et Raids.
                  Optimise ton gameplay avec les meilleurs experts digitaux d'Azeroth.
                </p>
              </div>

              {/* Dashboard Grid */}
              <DashboardGrid onModuleSelect={setActiveModule} />
            </motion.div>
          ) : (
            <motion.div
              key="module"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setActiveModule(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Retour au Nexus
                </Button>
                <div className="text-right">
                  <div className="text-xs font-bold text-violet-500 uppercase tracking-widest">Module Actif</div>
                  <div className="text-lg font-bold text-white tracking-tight">
                    {activeModule === 'coach' && "Assistant Stratégique"}
                    {activeModule === 'build' && "Analyseur de Talents"}
                    {activeModule === 'forge' && "La Forge"}
                  </div>
                </div>
              </div>

              <div className="min-h-[600px] flex items-center justify-center">
                {activeModule === 'coach' && <CoachModule />}
                {activeModule === 'build' && <BuildModule />}
                {activeModule === 'forge' && <ForgeModule />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
