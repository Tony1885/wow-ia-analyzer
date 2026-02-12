"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Cpu, Zap, Beaker, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RawLogTextAreaProps {
    onAnalyze: (rawText: string) => void;
    isProcessing: boolean;
}

const MOCK_RAW_LOG = `10/24 20:15:02.123  SPELL_CAST_SUCCESS,Player-1302-09A1B2C3,"Moussman-Ysondre",0x511,0x0,0000000000000000,nil,0x80000000,0x80000000,20271,0x10,"Jugement",0x1
10/24 20:15:03.456  SPELL_DAMAGE,Player-1302-09A1B2C3,"Moussman-Ysondre",0x511,0x0,Creature-0-3102-2290-71-162060-00004BD3AE,"Arbalétrier de l'Avant-garde",0x10a48,0x0,20271,"Jugement",0x1,250000,250000,0,0,0,0,0,0,0,0,nil,nil,nil,nil
10/24 20:15:04.789  SPELL_AURA_APPLIED,Player-1302-09A1B2C3,"Moussman-Ysondre",0x511,0x0,Player-1302-09A1B2C3,"Moussman-Ysondre",0x511,0x0,31884,"Courroux vengeur",0x1,Buff
10/24 20:15:05.123  SPELL_CAST_SUCCESS,Player-1302-09A1B2C3,"Moussman-Ysondre",0x511,0x0,Creature-0-3102-2290-71-162060-00004BD3AE,"Arbalétrier de l'Avant-garde",0x10a48,0x0,255937,"Traînée de cendres",0x1
10/24 20:15:05.123  SPELL_DAMAGE,Player-1302-09A1B2C3,"Moussman-Ysondre",0x511,0x0,Creature-0-3102-2290-71-162060-00004BD3AE,"Arbalétrier de l'Avant-garde",0x10a48,0x0,255937,"Traînée de cendres",0x1,850000,850000,0,0,0,0,0,0,0,0,nil,nil,nil,nil
10/24 20:15:06.456  SPELL_CAST_SUCCESS,Player-1302-09A1B2C3,"Moussman-Ysondre",0x511,0x0,0000000000000000,nil,0x80000000,0x80000000,85256,"Verdict du templier",0x1
10/24 20:15:07.789  SWING_DAMAGE,Creature-0-3102-2290-71-162060-00004BD3AE,"Arbalétrier de l'Avant-garde",0x10a48,0x0,Player-1302-09A1B2C3,"Moussman-Ysondre",0x511,0x0,120000,120000,0,0,0,0,0,0,0,0,nil,nil,nil,nil
10/24 20:15:08.123  SPELL_INTERRUPT,Player-1302-09A1B2C3,"Moussman-Ysondre",0x511,0x0,Creature-0-3102-2300-71-162061-00004BD3AF,"Mage de l'Avant-garde",0x10a48,0x0,96231,"Réprimande",0x1,200549,"Éclair de givre",0x10`;

export function RawLogTextArea({ onAnalyze, isProcessing }: RawLogTextAreaProps) {
    const [text, setText] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handleInsertMock = () => {
        setText(MOCK_RAW_LOG);
    };

    const handleAnalyze = () => {
        if (!text.trim()) return;
        onAnalyze(text);
    };

    return (
        <div className="w-full space-y-4">
            <div className="relative group">
                {/* Glow effect */}
                <div className={cn(
                    "absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-epic-500 to-mana-500 opacity-20 blur transition duration-1000 group-hover:opacity-40",
                    isFocused && "opacity-60 blur-md"
                )} />

                <div className="relative rounded-2xl bg-void-900 ring-1 ring-white/10 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-epic-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Analyse Directe (Raw Logs)
                            </span>
                        </div>
                        <button
                            onClick={handleInsertMock}
                            className="flex items-center gap-1.5 rounded-lg bg-epic-500/10 px-2.5 py-1 text-[10px] font-bold text-epic-400 ring-1 ring-epic-500/20 transition-all hover:bg-epic-500/20"
                        >
                            <Beaker className="h-3 w-3" />
                            Insérer Test M+
                        </button>
                    </div>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Collez ici les lignes de votre fichier WoWCombatLog.txt..."
                        className="w-full h-64 bg-transparent p-4 text-xs font-mono text-gray-300 placeholder:text-gray-600 focus:outline-none resize-none scrollbar-thin scrollbar-thumb-white/10"
                    />

                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-void-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
                        >
                            <div className="relative">
                                <Cpu className="h-10 w-10 text-epic-400 animate-pulse" />
                                <motion.div
                                    animate={{
                                        height: ["0%", "100%", "0%"],
                                        top: ["0%", "0%", "0%"]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-x-0 w-full h-1 bg-gradient-to-r from-transparent via-epic-400 to-transparent shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-white tracking-wide">SCANNING LOG DATA</p>
                                <p className="text-[10px] text-epic-400 font-mono mt-1">AI NEURAL PROCESSING...</p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <button
                onClick={handleAnalyze}
                disabled={!text.trim() || isProcessing}
                className="btn-legendary w-full flex items-center justify-center gap-3 py-4 group overflow-hidden relative"
            >
                <span className="relative z-10 flex items-center gap-2">
                    <Zap className="h-5 w-5 fill-current" />
                    Lancer l'Analyse Directe
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-epic-600 to-mana-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <p className="text-[10px] text-center text-gray-500 italic">
                Copié-collé limité à ~500 lignes pour une analyse optimale par Gemini.
            </p>
        </div>
    );
}
