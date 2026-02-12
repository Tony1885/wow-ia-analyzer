import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WoW AI Analyzer — Optimise ton build de talents",
  description:
    "Analyseur de talents intelligent pour WoW Retail. Décrypte tes codes Blizzard et reçois une rotation optimale générée par l'IA.",
  keywords: [
    "WoW",
    "World of Warcraft",
    "IA",
    "Talents",
    "Build",
    "Rotation",
    "Performance",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-[#020617] text-gray-200 antialiased selection:bg-violet-500/30">
        <main>{children}</main>
      </body>
    </html>
  );
}
