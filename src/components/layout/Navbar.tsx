"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, BarChart2, Shield, Hammer, Info } from "lucide-react"

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="flex items-center gap-8 px-8 py-3 rounded-full border border-white/10 bg-slate-950/50 backdrop-blur-md shadow-2xl"
            >
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="h-8 w-8 bg-violet-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <Sparkles size={18} className="text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tighter text-white">WoW AI <span className="text-violet-500">Nexus</span></span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <NavLink icon={<BarChart2 size={16} />} label="Coach" />
                    <NavLink icon={<Shield size={16} />} label="Build" />
                    <NavLink icon={<Hammer size={16} />} label="Forge" />
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-500 cursor-not-allowed">
                        <BarChart2 size={16} />
                        Logs
                        <span className="text-[10px] bg-white/5 px-1 rounded">Soon</span>
                    </div>
                </div>

                <div className="h-4 w-px bg-white/10" />

                <button className="text-sm font-bold text-violet-400 hover:text-white transition-colors">
                    Connexion
                </button>
            </motion.div>
        </nav>
    )
}

function NavLink({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <Link href="#" className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">
            {icon}
            {label}
        </Link>
    )
}
