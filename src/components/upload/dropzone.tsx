"use client";

import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertCircle, X, Shield, Eye, EyeOff, Search, ExternalLink, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DUMMY_MPLUS_REPORTS } from "@/lib/dummy-mplus";

interface DropzoneProps {
    onFileAccepted: (file: File | null, anonymize: boolean, characterInfo: { region: string, server: string, charName?: string, reportCode?: string }) => void;
    onTestMPlus?: (data: any) => void;
    isProcessing: boolean;
}

export function Dropzone({ onFileAccepted, onTestMPlus, isProcessing }: DropzoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [anonymize, setAnonymize] = useState(false);
    const [region, setRegion] = useState("eu");
    const [server, setServer] = useState("");
    const [charName, setCharName] = useState("");
    const [reportCode, setReportCode] = useState("");

    // WCL Search State
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const validateFile = useCallback((file: File): boolean => {
        if (!file.name.endsWith(".txt") && !file.name.endsWith(".log")) {
            setError("Format non supporté. Utilisez un fichier .txt ou .log");
            return false;
        }
        if (file.size > 100 * 1024 * 1024) {
            setError("Le fichier est trop volumineux (max 100 Mo)");
            return false;
        }
        setError(null);
        return true;
    }, []);

    const handleSearch = async () => {
        const query = charName.trim();

        // --- URL Extraction ---
        if (query.includes("warcraftlogs.com/reports/")) {
            const match = query.match(/\/reports\/([a-zA-Z0-9]+)/);
            if (match && match[1]) {
                setReportCode(match[1]);
                setCharName("");
                setError("Code de rapport extrait de l'URL ! Cliquez sur le bouton d'analyse en bas.");
                return;
            }
        }

        const normalizedCommand = query.toUpperCase().replace(/[-\s]/g, "_");

        // --- TEST MODE ---
        if (normalizedCommand === "TEST_MPLUS" || normalizedCommand === "TEST_M+") {
            setSearchResults(DUMMY_MPLUS_REPORTS);
            setError(null);
            return;
        }

        if (!charName || !server) return;
        setIsSearching(true);
        setError(null);
        setSearchResults([]);
        try {
            const res = await fetch(`/api/wcl/reports?name=${encodeURIComponent(charName)}&server=${encodeURIComponent(server)}&region=${region}`);
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.reports || []);
                if (!data.reports || data.reports.length === 0) {
                    setError(`Aucun rapport récent trouvé pour ${charName} sur ${server}.`);
                }
            } else {
                setError(data.error || "Impossible de récupérer les rapports.");
            }
        } catch (e) {
            setError("Erreur réseau lors de la recherche.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectReport = (report: any) => {
        if (report.code.startsWith("MOCK_")) {
            if (onTestMPlus) {
                onTestMPlus(report);
            } else {
                alert("Mode Test activé pour : " + report.title);
            }
            return;
        }

        // --- Real Report Analysis ---
        onFileAccepted(null, anonymize, {
            region,
            server,
            charName,
            reportCode: report.code
        });
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);

            const file = e.dataTransfer.files[0];
            if (file && validateFile(file)) {
                setSelectedFile(file);
            }
        },
        [validateFile]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file && validateFile(file)) {
                setSelectedFile(file);
            }
        },
        [validateFile]
    );

    const handleSubmit = useCallback(() => {
        if (selectedFile || reportCode) {
            onFileAccepted(selectedFile, anonymize, { region, server, charName, reportCode });
        }
    }, [selectedFile, anonymize, region, server, charName, reportCode, onFileAccepted]);

    const clearFile = useCallback(() => {
        setSelectedFile(null);
        setError(null);
    }, []);

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Search-First Interface */}
            <div className="space-y-6">
                <div className="text-center mb-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-epic-500/10 ring-1 ring-epic-500/20 mb-4">
                        <Search className="h-8 w-8 text-epic-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Recherche de rapports</h2>
                    <p className="text-sm text-gray-400 mt-2">
                        Entrez vos informations pour récupérer vos logs Warcraft Logs.
                    </p>
                </div>

                <div className="glass-card flex flex-col gap-5 p-6 border-epic-500/20 bg-epic-500/5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Nom du Personnage
                            </label>
                            <input
                                type="text"
                                placeholder="ex: Moussman"
                                value={charName}
                                onChange={(e) => setCharName(e.target.value)}
                                className="w-full rounded-lg bg-white/5 p-3 text-sm text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-epic-500/50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Serveur
                            </label>
                            <input
                                type="text"
                                placeholder="ex: Ysondre"
                                value={server}
                                onChange={(e) => setServer(e.target.value)}
                                className="w-full rounded-lg bg-white/5 p-3 text-sm text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-epic-500/50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                Région
                            </label>
                            <select
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="w-full rounded-lg bg-void-800 p-3 text-sm text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-epic-500/50"
                            >
                                <option value="eu">Europe (EU)</option>
                                <option value="us">Americas (US)</option>
                                <option value="kr">Korea (KR)</option>
                                <option value="tw">Taiwan (TW)</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={(!charName || (!server && charName.toUpperCase() !== "TEST_M+")) || isSearching}
                        className="btn-legendary flex items-center justify-center gap-2 py-4 text-base font-bold transition-all disabled:pointer-events-none disabled:opacity-40"
                    >
                        {isSearching ? (
                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <Search className="h-5 w-5" />
                        )}
                        Rechercher Rapport
                    </button>

                    <div className="flex items-center gap-3 px-1 my-2">
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">OU</span>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            Code Direct (Warcraft Logs)
                        </label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="abc123def456"
                                value={reportCode}
                                onChange={(e) => setReportCode(e.target.value)}
                                className="w-full rounded-lg bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-epic-500/50"
                            />
                        </div>
                    </div>
                </div>

                {/* Error Box */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-3 rounded-xl bg-danger-500/10 px-4 py-3 ring-1 ring-danger-500/20"
                        >
                            <AlertCircle className="h-4 w-4 shrink-0 text-danger-400" />
                            <p className="text-sm text-danger-400">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Search Results */}
                <AnimatePresence>
                    {searchResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 overflow-hidden"
                        >
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-1">
                                Rapports récents trouvés
                            </h3>
                            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                {searchResults.map((report: any) => (
                                    <button
                                        key={report.code}
                                        onClick={() => handleSelectReport(report)}
                                        className="flex w-full items-center justify-between rounded-xl bg-white/5 p-4 text-left transition-all hover:bg-white/10 ring-1 ring-white/5 group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-void-800 text-epic-400 group-hover:scale-110 transition-transform">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white leading-tight">{report.title}</p>
                                                <p className="text-xs text-gray-500 mt-1">{report.zone?.name || "Inconnu"}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <span className="text-[10px] font-medium text-gray-400 bg-white/5 px-2 py-1 rounded">
                                                {new Date(report.startTime).toLocaleDateString()}
                                            </span>
                                            <ExternalLink className="h-3 w-3 text-epic-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit Logic (if manual code entered) */}
                <AnimatePresence>
                    {reportCode && searchResults.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="pt-4"
                        >
                            <button
                                onClick={handleSubmit}
                                disabled={isProcessing}
                                className="btn-legendary w-full py-4 text-lg"
                            >
                                {isProcessing ? "Analyse..." : "🚀 Analyser ce rapport"}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
