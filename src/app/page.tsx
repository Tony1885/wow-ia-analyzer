"use client"

import React from "react"
import { motion } from "framer-motion"
import { Sparkles, LayoutGrid } from "lucide-react"
import { BuildModule } from "@/components/modules/BuildModule"

export default function HomePage() {
  return (
    <div className="relative min-h-screen pt-24 pb-12 px-4 md:px-8 overflow-hidden bg-[#020617]">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-600/10 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles size={14} />
            WoW AI Analyzer
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
            Optimise tes Talents <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-violet-500 bg-clip-text text-transparent">
              avec l&apos;Intelligence Artificielle
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Colle ton code Blizzard et laisse l&apos;IA décrypter ta classe, ta spé et ta rotation optimale.
          </p>
        </div>

        {/* Main Content: Talent Analyzer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <BuildModule />
        </motion.div>
      </div>
    </div>
  )
}
