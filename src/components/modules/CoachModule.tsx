"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export function CoachModule() {
    const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
        { role: "ai", content: "Salut Champion ! Je suis ton Coach Stratégique. De quel boss ou donjon souhaites-tu discuter aujourd'hui ?" }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsg = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: "user", content: userMsg }])
        setIsLoading(true)

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                body: JSON.stringify({ message: userMsg, mode: "coach" }),
                headers: { "Content-Type": "application/json" }
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.details || data.error || "Erreur API")
            setMessages(prev => [...prev, { role: "ai", content: data.text }])
        } catch (error: any) {
            setMessages(prev => [...prev, { role: "ai", content: `Erreur : ${error.message}` }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto border border-white/10 rounded-2xl bg-slate-950/50 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-violet-600" : "bg-slate-800 border border-white/10"
                                    }`}>
                                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                    ? "bg-violet-600/20 text-white rounded-tr-none border border-violet-500/20"
                                    : "bg-slate-900/50 text-gray-200 rounded-tl-none border border-white/5"
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 items-center text-slate-500 text-sm">
                            <Loader2 className="animate-spin" size={16} />
                            Le coach réfléchit...
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-white/10 bg-slate-950/80">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Pose ta question au coach..."
                        className="bg-slate-900/50 border-white/5"
                    />
                    <Button onClick={handleSend} variant="violet" disabled={isLoading}>
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    )
}
