"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { ClipboardList, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function BuildModule() {
    const [code, setCode] = useState("")
    const [analysis, setAnalysis] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleAnalyze = async () => {
        if (!code.trim() || isLoading) return
        setIsLoading(true)
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                body: JSON.stringify({
                    message: `Analyse ce code de talents Blizzard et suggère des optimisations : ${code}`,
                    mode: "build"
                }),
                headers: { "Content-Type": "application/json" }
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.details || data.error || "Erreur API")
            setAnalysis(data.text)
        } catch (error: any) {
            setAnalysis(`Erreur technique : ${error.message}`);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="grid lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
            <Card className="bg-slate-950/50 border-white/10 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-400">
                        <ClipboardList size={20} />
                        Configurateur
                    </CardTitle>
                    <CardDescription>
                        Colle ton code de talents Blizzard pour recevoir des suggestions d&apos;optimisation.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Ex: B4EAAAAAAAAAAAAAAAAAAAAAA... (Code Blizzard)"
                        className="min-h-[200px] font-mono text-xs bg-slate-900/50 border-white/5"
                    />
                    <Button
                        onClick={handleAnalyze}
                        className="w-full"
                        variant="gold"
                        disabled={isLoading || !code.trim()}
                    >
                        {isLoading ? <Loader2 className="mr-2 animate-spin" size={18} /> : <Sparkles className="mr-2" size={18} />}
                        Analyser le Build
                    </Button>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {analysis ? (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Card className="bg-slate-900/30 border-amber-500/20">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-amber-500">Résultat de l&apos;Expert</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
                                {analysis}
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-12 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                        <div className="h-16 w-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                            <ClipboardList className="text-slate-700" size={32} />
                        </div>
                        <p className="text-slate-500">Attente de données talents...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
