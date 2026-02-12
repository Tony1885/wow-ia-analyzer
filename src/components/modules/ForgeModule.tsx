"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Zap, Copy, Check, Loader2, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function ForgeModule() {
    const [prompt, setPrompt] = useState("")
    const [macro, setMacro] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        if (!prompt.trim() || isLoading) return
        setIsLoading(true)
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                body: JSON.stringify({
                    message: `Génère une macro WoW pour : ${prompt}`,
                    mode: "forge"
                }),
                headers: { "Content-Type": "application/json" }
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Erreur API")
            setMacro(data.text)
        } catch (error: any) {
            setMacro(`Erreur : ${error.message}.`);
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(macro)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                    <Zap className="text-blue-400 fill-blue-400/20" />
                    La Forge aux Macros
                </h2>
                <p className="text-slate-400">Décris ce que tu veux, l&apos;IA forge le script parfait.</p>
            </div>

            <div className="flex gap-2">
                <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    placeholder="Ex: Macro mouseover pour Mot de pouvoir : Bouclier avec modificateur shift pour Soins rapides"
                    className="h-12 bg-slate-900/50 border-white/10 text-white"
                />
                <Button
                    onClick={handleGenerate}
                    variant="violet"
                    className="h-12 px-6"
                    disabled={isLoading || !prompt.trim()}
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                </Button>
            </div>

            {macro && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="bg-slate-900/40 border-blue-500/20 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-3 bg-blue-500/10 border-b border-blue-500/20">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-tighter">Script Forgé</span>
                            <Button onClick={handleCopy} variant="ghost" size="sm" className="h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                                {copied ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
                                {copied ? "Copié" : "Copier"}
                            </Button>
                        </div>
                        <CardContent className="p-6">
                            <pre className="font-mono text-sm text-gray-200 whitespace-pre-wrap break-all bg-black/30 p-4 rounded-lg border border-white/5">
                                {macro}
                            </pre>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    )
}
