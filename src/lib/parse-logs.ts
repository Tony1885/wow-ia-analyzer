/**
 * Parsing intelligent des logs pour Gemini 1.5 Flash
 */

export function parseLogsForGemini(rawLog: string): string {
    // Supprimer le caractère BOM si présent
    const cleanContent = rawLog.startsWith("\uFEFF") ? rawLog.slice(1) : rawLog;

    // Séparer les lignes et filter les lignes vides
    const lines = cleanContent.split("\n").filter(line => line.trim().length > 0);

    // On ne garde que les lignes qui ressemblent à des événements de combat
    // (commencent par une date ou un timestamp)
    const combatEvents = lines.filter(line => {
        // Pattern flexible pour le début d'une ligne de combat (date ou timestamp)
        return /^(\d{1,2}\/\d{1,2}|\d{4}-\d{2}-\d{2})/.test(line.trim());
    });

    // Si le fichier est trop gros, on extrait seulement les 5 000 dernières lignes (fin du combat)
    const MAX_LINES = 5000;
    const finalLines = combatEvents.length > MAX_LINES
        ? combatEvents.slice(-MAX_LINES)
        : combatEvents;

    return finalLines.join("\n");
}
