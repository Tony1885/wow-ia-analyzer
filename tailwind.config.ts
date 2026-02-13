import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Deep Raid Night Theme
                void: {
                    900: "#020617",
                    800: "#0a0f1e",
                    700: "#111827",
                    600: "#1e293b",
                    500: "#334155",
                },
                // Epic Violet
                epic: {
                    50: "#f5f3ff",
                    100: "#ede9fe",
                    200: "#ddd6fe",
                    300: "#c4b5fd",
                    400: "#a78bfa",
                    500: "#8b5cf6",
                    600: "#7c3aed",
                    700: "#6d28d9",
                    800: "#5b21b6",
                    900: "#4c1d95",
                },
                // Legendary Gold
                legendary: {
                    50: "#fffbeb",
                    100: "#fef3c7",
                    200: "#fde68a",
                    300: "#fcd34d",
                    400: "#fbbf24",
                    500: "#f59e0b",
                    600: "#d97706",
                    700: "#b45309",
                    800: "#92400e",
                    900: "#78350f",
                },
                // Mana Blue
                mana: {
                    50: "#eff6ff",
                    100: "#dbeafe",
                    200: "#bfdbfe",
                    300: "#93c5fd",
                    400: "#60a5fa",
                    500: "#3b82f6",
                    600: "#2563eb",
                    700: "#1d4ed8",
                    800: "#1e40af",
                    900: "#1e3a8a",
                },
                // Red for damage / errors
                danger: {
                    400: "#f87171",
                    500: "#ef4444",
                    600: "#dc2626",
                },
                // Green for healing / success
                healing: {
                    400: "#4ade80",
                    500: "#22c55e",
                    600: "#16a34a",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                display: ["Outfit", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "hero-glow":
                    "radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.15) 0%, transparent 60%)",
                "card-gradient":
                    "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)",
            },
            boxShadow: {
                glow: "0 0 20px rgba(139, 92, 246, 0.3)",
                "glow-lg": "0 0 40px rgba(139, 92, 246, 0.4)",
                "glow-gold": "0 0 20px rgba(251, 191, 36, 0.3)",
                glass: "0 8px 32px 0 rgba(0, 0, 0, 0.36)",
            },
            keyframes: {
                "pulse-glow": {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.5" },
                },
                "scan-line": {
                    "0%": { transform: "translateY(-100%)" },
                    "100%": { transform: "translateY(100%)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                "gradient-xy": {
                    "0%, 100%": {
                        "background-size": "400% 400%",
                        "background-position": "left center"
                    },
                    "50%": {
                        "background-size": "200% 200%",
                        "background-position": "right center"
                    }
                }
            },
            animation: {
                "pulse-glow": "pulse-glow 2s ease-in-out infinite",
                "scan-line": "scan-line 3s ease-in-out infinite",
                "float": "float 6s ease-in-out infinite",
                "shimmer": "shimmer 2s linear infinite",
                "spin-slow": "spin 8s linear infinite",
                "gradient-xy": "gradient-xy 6s ease infinite",
            },
            backdropBlur: {
                xs: "2px",
            },
        },
    },
    plugins: [],
};

export default config;
