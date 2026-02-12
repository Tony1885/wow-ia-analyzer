import { AIInsight, PlayerPerformance } from "./types";

/**
 * Local Analysis Fallback
 * Provides basic insights based on real performance metrics when the AI fails.
 */
export function generateLocalAnalysis(performance: PlayerPerformance): AIInsight {
    const isTank = performance.role === "Tank";
    const highDps = performance.dps > 500000;

    return {
        summary: `Analyse locale effectuée pour ${performance.playerName}. Tes statistiques réelles (DPS: ${performance.dps.toLocaleString()}) ont été extraites avec succès, mais le moteur d'IA détaillé est temporairement indisponible.`,
        strengths: [
            "Extraction des données de combat réussie",
            performance.dps > 0 ? "Activité détectée dans le log" : "Présence en combat confirmée",
            "Structure du log valide"
        ],
        improvements: [
            {
                area: "Moteur d'IA",
                description: "L'analyse avancée par Gemini a échoué. Vérifiez votre clé API ou réessayez plus tard pour des conseils personnalisés sur votre rotation.",
                impact: "high",
                priority: 1
            },
            {
                area: "Statistiques",
                description: `Ton DPS actuel est de ${performance.dps.toLocaleString()}. Compare-le aux moyennes de ta classe pour évaluer ta progression.`,
                impact: "medium",
                priority: 2
            }
        ],
        overallGrade: performance.dps > 800000 ? "A" : (performance.dps > 400000 ? "B" : "C"),
        actionPlan: [
            {
                title: "Configurer l'API Gemini",
                description: "Pour obtenir des conseils de coach réels, assurez-vous que GOOGLE_AI_API_KEY est valide sur Vercel.",
                priority: 1,
                category: "gear"
            },
            {
                title: "Vérifier la Rotation",
                description: "Même sans IA, surveille tes procs et ton uptime de buffs dans le dashboard ci-dessous.",
                priority: 2,
                category: "rotation"
            }
        ],
        detailedAnalysis: "Ceci est une analyse de secours générée localement. Les graphiques et les métriques de performance affichés ci-dessous proviennent bien de tes données réelles de combat."
    };
}
