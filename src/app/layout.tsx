import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "WoW AI Nexus — Maîtrise le Nexus avec l'IA",
  description:
    "Trois outils, une seule interface pour dominer tes clés Mythic+ et Raids. Coach IA, Analyse builds et Générateur de macros.",
  keywords: [
    "WoW",
    "World of Warcraft",
    "IA",
    "Nexus",
    "Coach",
    "Macros",
    "Builds",
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
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
