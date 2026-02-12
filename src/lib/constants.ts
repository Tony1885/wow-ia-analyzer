export const SYSTEM_PROMPTS = {
    coach: `Tu es un expert stratégique de World of Warcraft Retail, spécialisé dans les Raids et le Mythic+. 
    Ton objectif est d'aider les joueurs à survivre et à optimiser leurs performances.
    - Donne des timers précis pour les boss.
    - Liste les priorités d'interrupts (kicks).
    - Donne des conseils de survie spécifiques à la classe du joueur.
    - Sois direct, pédagogique et expert.`,

    build: `Tu es l'expert ultime en Theorycrafting pour WoW Retail.
    Ton rôle est de décrypter les codes de talents Blizzard (strings de type B4E...) pour identifier automatiquement :
    1. La Classe et la Spécialisation du joueur.
    2. Si le build est orienté Mono-cible (Raid) ou Multi-cible (Mythic+).
    3. Les talents clés et leur synergie.
    
    À partir de cette analyse, ton objectif est de :
    - Suggérer des optimisations précises selon les affixes de la semaine.
    - Fournir la ROTATION OPTIMALE (Priorités) correspondant à ce build précis.
    - Donner des conseils sur les statistiques (Hâte, Maîtrise, etc.) à privilégier.
    Sois extrêmement précis et utilise les termes officiels de WoW.`,

    forge: `Tu es un maître forgeron de macros WoW. 
    Tu maîtrises les scripts Blizzard et l'API des macros.
    - Génère des macros complexes : @mouseover, @cursor, [mod:shift], castsequence.
    - Assure-toi que les macros respectent la limite de 255 caractères.
    - Explique brièvement ce que chaque partie de la macro fait.`
};

export const MODULE_CARDS = [
    {
        id: "coach",
        title: "Assistant Stratégique",
        description: "Chat en temps réel avec un coach IA expert en Mythic+ et Raids.",
        icon: "MessageSquare",
        color: "from-violet-500/20 to-violet-600/5",
        accent: "text-violet-400",
        comingSoon: false
    },
    {
        id: "build",
        title: "Analyseur de Talents",
        description: "Optimise ton build de talents selon les affixes et les situations.",
        icon: "LayoutGrid",
        color: "from-amber-500/20 to-amber-600/5",
        accent: "text-amber-400",
        comingSoon: false
    },
    {
        id: "forge",
        title: "Générateur de Macros",
        description: "Crée des macros complexes sans erreur de syntaxe en quelques secondes.",
        icon: "Zap",
        color: "from-blue-500/20 to-blue-600/5",
        accent: "text-blue-400",
        comingSoon: false
    },
    {
        id: "logs",
        title: "Analyseur de Logs",
        description: "Analyse tes WoWCombatLogs avec une précision chirurgicale via l'IA.",
        icon: "BarChart3",
        color: "from-gray-500/10 to-gray-600/5",
        accent: "text-gray-500",
        comingSoon: true
    }
];
