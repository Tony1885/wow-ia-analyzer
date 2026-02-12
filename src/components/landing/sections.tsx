"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Upload,
    Brain,
    TrendingUp,
    Shield,
    Zap,
    ArrowRight,
    ChevronRight,
    Sparkles,
    BarChart3,
    Target,
} from "lucide-react";

// ============================================================
// Hero Section
// ============================================================
export function HeroSection() {
    return (
        <section className="relative min-h-screen overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-hero-glow" />
            <div className="absolute inset-0 dot-grid opacity-40" />

            {/* Floating orbs */}
            <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-float rounded-full bg-epic-500/5 blur-3xl" />
            <div
                className="absolute right-1/4 top-1/3 h-48 w-48 rounded-full bg-mana-500/5 blur-3xl"
                style={{ animationDelay: "2s" }}
            />
            <div
                className="absolute bottom-1/4 left-1/3 h-56 w-56 rounded-full bg-legendary-400/5 blur-3xl"
                style={{ animationDelay: "4s" }}
            />

            <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pt-24 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <span className="inline-flex items-center gap-2 rounded-full bg-epic-500/10 px-4 py-2 text-sm font-medium text-epic-400 ring-1 ring-epic-500/20">
                        <Sparkles className="h-4 w-4" />
                        Propulsé par Claude IA — Patch 12.1 compatible
                    </span>
                </motion.div>

                {/* Main title */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="font-display text-5xl font-black leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
                >
                    <span className="text-white">L&apos;IA au service</span>
                    <br />
                    <span className="text-gradient-epic">de ton DPS</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl"
                >
                    Upload ton log de combat, laisse l&apos;intelligence artificielle
                    analyser tes performances et obtiens des conseils{" "}
                    <span className="text-white">actionnables et personnalisés</span>{" "}
                    pour chaque encounter.
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
                >
                    <Link href="/analyze" className="btn-legendary group flex items-center gap-3 text-lg">
                        <Upload className="h-5 w-5" />
                        Analyser mes logs
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                        href="/analyze?demo=true"
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-medium text-gray-300 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                    >
                        <Sparkles className="h-4 w-4 text-epic-400" />
                        Voir une démo
                    </Link>
                </motion.div>

                {/* Social proof */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mt-16 flex items-center gap-3 text-sm text-gray-600"
                >
                    <div className="flex -space-x-2">
                        {["🧙", "⚔️", "🛡️", "🏹", "✨"].map((emoji, i) => (
                            <div
                                key={i}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-void-700 ring-2 ring-void-900"
                            >
                                <span className="text-xs">{emoji}</span>
                            </div>
                        ))}
                    </div>
                    <span>
                        Utilisé par des raiders de toutes les guildes
                    </span>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-8"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex flex-col items-center gap-2 text-gray-600"
                    >
                        <span className="text-xs">Découvrir</span>
                        <ChevronRight className="h-4 w-4 rotate-90" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

// ============================================================
// How It Works Section
// ============================================================
const steps = [
    {
        step: "01",
        title: "Upload ton log",
        description:
            "Glisse ton fichier WoWCombatLog.txt directement sur la page. Zéro inscription, zéro friction.",
        icon: <Upload className="h-7 w-7" />,
        color: "from-mana-500 to-mana-600",
        glowColor: "rgba(59, 130, 246, 0.2)",
    },
    {
        step: "02",
        title: "L'IA analyse ton combat",
        description:
            "Notre moteur parse tes événements et envoie les données pertinentes à Claude Sonnet 4 pour une analyse experte et ultra-précise.",
        icon: <Brain className="h-7 w-7" />,
        color: "from-epic-500 to-epic-600",
        glowColor: "rgba(139, 92, 246, 0.2)",
    },
    {
        step: "03",
        title: "Reçois ton plan d'action",
        description:
            "Un rapport complet avec tes points forts, erreurs, et les 3 actions concrètes pour progresser immédiatement.",
        icon: <TrendingUp className="h-7 w-7" />,
        color: "from-legendary-500 to-legendary-600",
        glowColor: "rgba(251, 191, 36, 0.2)",
    },
];

export function HowItWorksSection() {
    return (
        <section id="how-it-works" className="relative py-32">
            <div className="mx-auto max-w-7xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <span className="inline-flex items-center gap-2 rounded-full bg-epic-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-epic-400 ring-1 ring-epic-500/20">
                        The Loop
                    </span>
                    <h2 className="mt-5 font-display text-4xl font-bold text-white sm:text-5xl">
                        3 clics. Zéro friction.
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                        De tes logs bruts à un coaching IA personnalisé.
                    </p>
                </motion.div>

                <div className="mt-20 grid gap-8 md:grid-cols-3">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.step}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="group glass-card-hover relative p-8"
                        >
                            {/* Step number */}
                            <span className="absolute right-6 top-6 font-display text-4xl font-black text-white/5">
                                {step.step}
                            </span>

                            {/* Icon */}
                            <div
                                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg transition-transform group-hover:scale-110`}
                            >
                                {step.icon}
                            </div>

                            <h3 className="mt-6 font-display text-xl font-bold text-white">
                                {step.title}
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-gray-400">
                                {step.description}
                            </p>

                            {/* Connector line on desktop */}
                            {i < steps.length - 1 && (
                                <div className="absolute -right-4 top-1/2 hidden h-0.5 w-8 bg-gradient-to-r from-white/10 to-transparent md:block" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ============================================================
// Features Section
// ============================================================
const features = [
    {
        title: "Analyse IA narrative",
        description:
            "Pas de simples chiffres. Un résumé écrit par l'IA qui te dit exactement ce qui s'est passé et pourquoi.",
        icon: <Brain className="h-6 w-6" />,
        color: "text-epic-400",
        bg: "bg-epic-400/10 ring-epic-400/20",
    },
    {
        title: "DPS/HPS Timeline",
        description:
            "Visualise ta performance seconde par seconde. Identifie chaque pic et chaque creux.",
        icon: <BarChart3 className="h-6 w-6" />,
        color: "text-mana-400",
        bg: "bg-mana-400/10 ring-mana-400/20",
    },
    {
        title: "Dégâts évitables",
        description:
            "Liste rouge de chaque mécanique ratée avec les dégâts subis et la solution pour la prochaine fois.",
        icon: <Target className="h-6 w-6" />,
        color: "text-danger-400",
        bg: "bg-danger-400/10 ring-danger-400/20",
    },
    {
        title: "Plan d'action Top 3",
        description:
            "Les 3 améliorations concrètes à impact maximum pour progresser immédiatement.",
        icon: <TrendingUp className="h-6 w-6" />,
        color: "text-legendary-400",
        bg: "bg-legendary-400/10 ring-legendary-400/20",
    },
    {
        title: "Uptime Tracker",
        description:
            "Analyse de chaque buff et debuff critique avec comparaison vs l'optimal.",
        icon: <Zap className="h-6 w-6" />,
        color: "text-healing-400",
        bg: "bg-healing-400/10 ring-healing-400/20",
    },
    {
        title: "RGPD compliant",
        description:
            "Zéro stockage permanent. Option d'anonymisation des noms. Tes données restent les tiennes.",
        icon: <Shield className="h-6 w-6" />,
        color: "text-gray-400",
        bg: "bg-gray-400/10 ring-gray-400/20",
    },
];

export function FeaturesSection() {
    return (
        <section id="features" className="relative py-32">
            {/* Subtle background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-epic-500/[0.02] to-transparent" />

            <div className="relative mx-auto max-w-7xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <span className="inline-flex items-center gap-2 rounded-full bg-legendary-400/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-legendary-400 ring-1 ring-legendary-400/20">
                        Fonctionnalités
                    </span>
                    <h2 className="mt-5 font-display text-4xl font-bold text-white sm:text-5xl">
                        Tout ce qu&apos;il faut pour{" "}
                        <span className="text-gradient-legendary">dominer</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                        Plus qu&apos;un parse. Un véritable coach IA personnel.
                    </p>
                </motion.div>

                <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card-hover p-6"
                        >
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${feature.bg}`}
                            >
                                <span className={feature.color}>{feature.icon}</span>
                            </div>
                            <h3 className="mt-5 font-display text-lg font-bold text-white">
                                {feature.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-gray-400">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ============================================================
// Trust Bar
// ============================================================
export function TrustBar() {
    return (
        <section className="border-y border-white/5 bg-white/[0.01] py-12">
            <div className="mx-auto max-w-7xl px-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center gap-6 text-center"
                >
                    <p className="text-sm font-medium text-gray-500">
                        Compatible avec le contenu actuel —{" "}
                        <span className="text-white">Patch 12.1</span>
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {[
                            "Libération d'Undermine",
                            "Mythic+",
                            "Raids Mythiques & Héroïques",
                            "Tous les encounters",
                            "Toutes les classes & spés",
                        ].map((item) => (
                            <span
                                key={item}
                                className="rounded-lg bg-white/[0.03] px-4 py-2 text-xs font-medium text-gray-400 ring-1 ring-white/5"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// ============================================================
// CTA Section
// ============================================================
export function CTASection() {
    return (
        <section className="relative py-32 overflow-hidden">
            {/* Epic glow background */}
            <div className="absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-epic-500/10 blur-[120px]" />
            </div>

            <div className="relative mx-auto max-w-4xl px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">
                        Prêt à{" "}
                        <span className="text-gradient-epic">
                            élever ton gameplay
                        </span>{" "}
                        ?
                    </h2>
                    <p className="mt-5 text-lg text-gray-400">
                        Rejoins les joueurs qui utilisent l&apos;IA pour transformer chaque
                        wipe en leçon et chaque kill en victoire.
                    </p>

                    <Link
                        href="/analyze"
                        className="btn-legendary mt-10 inline-flex items-center gap-3 text-lg"
                    >
                        <Upload className="h-5 w-5" />
                        Lancer mon analyse gratuite
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
