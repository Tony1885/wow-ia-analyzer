"use client"

import React from "react"
import { motion } from "framer-motion"
import { Sparkles, Brain } from "lucide-react"
import { BuildModule } from "@/components/modules/BuildModule"

export default function HomePage() {
  return (
    <div className="relative min-h-screen pt-24 pb-12 px-4 md:px-8 overflow-hidden bg-[#020617]">
      {/* Background elements - Premium glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/10 blur-[120px] animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-sm font-bold uppercase tracking-widest"
          >
            <Brain size={16} className="text-amber-500" />
            WoW Analyzeur AI
          </motion.div>

          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-tight">
            Optimise ton Build <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-violet-400 bg-clip-text text-transparent">
              avec l&apos;IA de pointe
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto font-medium">
            Décrypte ta classe, ta spécialisation et reçois ta rotation optimale <br className="hidden md:block" />
            directement à partir de ton code Blizzard.
          </p>
        </div>

        {/* Main Content: Talent Analyzer */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="w-full relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-violet-500/20 rounded-3xl blur-xl opacity-20 -z-10" />
          <BuildModule />
        </motion.div>

        {/* Trust Footer */}
        <div className="text-center pt-12">
          <p className="text-slate-600 text-sm font-mono uppercase tracking-[0.3em]">
            Propulsé par Google Gemini 1.5 Flash • Optimisé pour WoW Retail
          </p>
        </div>
      </div>
    </div>
  )
}
