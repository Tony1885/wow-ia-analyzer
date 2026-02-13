"use client"

import React from "react"
import { motion } from "framer-motion"
import { Sparkles, Brain } from "lucide-react"
import { BuildModule } from "@/components/modules/BuildModule"

export default function HomePage() {
  return (
    <div className="relative min-h-screen pt-24 pb-12 px-4 md:px-8 overflow-hidden bg-[#0a0a0a] text-white selection:bg-amber-500/30">

      {/* --- PREMIUM BACKGROUND --- */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Animated Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-violet-600/20 blur-[128px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-amber-600/20 blur-[128px] animate-pulse delay-700" />
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[30vw] h-[30vw] rounded-full bg-indigo-500/10 blur-[96px] mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto space-y-20 relative z-10">

        {/* --- HERO SECTION --- */}
        <div className="text-center space-y-8 pt-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)] backdrop-blur-md"
          >
            <Sparkles size={14} className="animate-spin-slow" />
            WoW Analyzer AI V2
          </motion.div>

          <motion.h1
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9]"
          >
            <span className="block text-white drop-shadow-2xl">OPTIMISE</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]">
              TON BUILD
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Ne laisse plus le hasard décider de tes parses. <br />
            <span className="text-slate-200">L&apos;Intelligence Artificielle</span> décrypte tes talents, ton stuff et ta rotation pour te propulser au sommet.
          </motion.p>
        </div>

        {/* --- MODULE CONTAINER --- */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, type: "spring" }}
          className="w-full max-w-3xl mx-auto relative"
        >
          {/* Glowing Border Layout */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500 opacity-30 blur-xl animate-gradient-xy" />
          <div className="relative">
            <BuildModule />
          </div>
        </motion.div>

        {/* --- FOOTER --- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center pb-8 opacity-60 hover:opacity-100 transition-opacity"
        >
          <div className="flex items-center justify-center gap-6 text-xs font-mono uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Gemini 1.5 Pro</span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Raider.io API</span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Warcraft Logs API v2</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
