"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ClipboardList, Sparkles, Loader2, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function BuildModule() {
    const router = useRouter()
    const [code, setCode] = useState("")
    const [charName, setCharName] = useState("")
    const [realm, setRealm] = useState("Hyjal")
    const [region, setRegion] = useState("eu")
    const [isLoading, setIsLoading] = useState(false)

    const handleAnalyze = async () => {
        if (!code.trim()) return
        setIsLoading(true)
        // Redirection vers la page d'analyse avec le code en paramètre
        router.push(`/analyze?code=${encodeURIComponent(code)}`)
    }

    const handleImportFromRio = async () => {
        if (!charName.trim()) return
        setIsLoading(true)

        if (charName.includes("warcraftlogs.com")) {
            router.push(`/analyze?code=${encodeURIComponent(charName)}`)
            return
        }

        // Redirection vers la page d'analyse avec les infos Raider.io
        router.push(`/analyze?region=${region}&realm=${realm}&name=${encodeURIComponent(charName)}`)
    }

    return (
        <div className="w-full">
            <Card className="bg-black/60 border-white/10 backdrop-blur-2xl overflow-hidden shadow-2xl relative">
                {/* Top Gradient Line */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

                <CardHeader className="text-center pb-2 pt-8">
                    <CardTitle className="flex flex-col items-center gap-2 text-white text-2xl font-black uppercase tracking-tight">
                        <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2">
                            <User className="text-amber-500" size={24} />
                        </div>
                        Analyser un Personnage
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-base max-w-md mx-auto">
                        Renseigne ton pseudo pour récupérer tes talents via Raider.io ou colle un lien WarcraftLogs.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-8">
                    <div className="space-y-6">
                        {/* Region & Realm Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Région</label>
                                <Input
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    placeholder="eu"
                                    className="bg-white/5 border-white/10 h-12 text-center text-lg font-mono text-white focus:border-amber-500/50 focus:ring-amber-500/20 transition-all rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Serveur</label>
                                <Input
                                    value={realm}
                                    onChange={(e) => setRealm(e.target.value)}
                                    placeholder="Hyjal"
                                    className="bg-white/5 border-white/10 h-12 text-center text-lg font-medium text-white focus:border-amber-500/50 focus:ring-amber-500/20 transition-all rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Character Name Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Personnage ou Lien WCL</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors">
                                    <Search size={20} />
                                </div>
                                <Input
                                    value={charName}
                                    onChange={(e) => setCharName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleImportFromRio()}
                                    placeholder="Nom du perso (ex: Sylvanas) ou URL..."
                                    className="bg-white/5 border-white/10 h-14 pl-12 text-lg font-medium text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Action Button */}
                        <Button
                            onClick={handleImportFromRio}
                            className="w-full h-14 text-lg uppercase font-black tracking-widest bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all transform hover:-translate-y-0.5 rounded-xl border-none"
                            disabled={isLoading || !charName.trim()}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={20} /> Analyse en cours...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="fill-black/20" size={20} />
                                    Lancer l&apos;Analyse
                                </span>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
