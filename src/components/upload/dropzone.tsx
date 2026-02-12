"use client";

import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertCircle, X, Shield, Eye, EyeOff, Search, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
    onFileAccepted: (file: File, anonymize: boolean, characterInfo: { region: string, server: string, charName?: string }) => void;
    isProcessing: boolean;
}

export function Dropzone({ onFileAccepted, isProcessing }: DropzoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [anonymize, setAnonymize] = useState(false);
    const [region, setRegion] = useState("eu");
    const [server, setServer] = useState("");
    const [charName, setCharName] = useState("");

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
        if (!charName || !server) return;
        setIsSearching(true);
        setError(null);
        setSearchResults([]);
        try {
            const res = await fetch(`/api/wcl/reports?name=${encodeURIComponent(charName)}&server=${encodeURIComponent(server)}&region=${region}`);
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.reports);
                if (data.reports.length === 0) {
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
        // Pour l'instant on ouvre sur WCL, mais on pourrait implémenter l'analyse directe via l'API
        window.open(`https://www.warcraftlogs.com/reports/${report.code}`, '_blank');
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
        if (selectedFile) {
            onFileAccepted(selectedFile, anonymize, { region, server, charName });
        }
    }, [selectedFile, anonymize, region, server, charName, onFileAccepted]);

    const clearFile = useCallback(() => {
        setSelectedFile(null);
        setError(null);
    }, []);

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Dropzone Area */}
            <motion.div
                layout
                className={cn(
                    "relative rounded-2xl border-2 border-dashed transition-all duration-300",
                    isDragOver
                        ? "border-epic-500 bg-epic-500/10 scale-[1.02]"
                        : selectedFile
                            ? "border-epic-500/30 bg-epic-500/5"
                            : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
                    isProcessing && "pointer-events-none opacity-60"
                )}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
            >
                {/* Background glow when dragging */}
                <AnimatePresence>
                    {isDragOver && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="pointer-events-none absolute inset-0 rounded-2xl"
                            style={{
                                background:
                                    "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
                            }}
                        />
                    )}
                </AnimatePresence>

                <div className="relative flex flex-col items-center gap-6 p-12">
                    <AnimatePresence mode="wait">
                        {selectedFile ? (
                            <motion.div
                                key="file-selected"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-epic-500/10 ring-1 ring-epic-500/20">
                                    <FileText className="h-8 w-8 text-epic-400" />
                                    <button
                                        onClick={clearFile}
                                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-void-700 text-gray-400 ring-1 ring-white/10 transition-colors hover:bg-danger-600 hover:text-white"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-white">{selectedFile.name}</p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="no-file"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <motion.div
                                    animate={{ y: isDragOver ? -5 : 0 }}
                                    className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-epic-500/10 to-mana-500/10 ring-1 ring-white/10"
                                >
                                    <Upload className="h-10 w-10 text-epic-400" />
                                </motion.div>
                                <div className="text-center">
                                    <p className="text-lg font-medium text-white">
                                        Glissez votre log de combat ici
                                    </p>
                                    <p className="mt-2 text-sm text-gray-500">
                                        ou{" "}
                                        <label className="cursor-pointer text-epic-400 underline decoration-epic-400/30 underline-offset-4 transition-colors hover:text-epic-300">
                                            parcourez vos fichiers
                                            <input
                                                type="file"
                                                accept=".txt,.log"
                                                onChange={handleFileInput}
                                                className="hidden"
                                            />
                                        </label>
                                    </p>
                                    <p className="mt-3 text-xs text-gray-600">
                                        Fichiers .txt & .log acceptés · Max 100 Mo
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 flex items-center gap-3 rounded-xl bg-danger-500/10 px-4 py-3 ring-1 ring-danger-500/20"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0 text-danger-400" />
                        <p className="text-sm text-danger-400">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Character Info (Always visible for discoverability) */}
            <div className="mt-8 space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Lier avec Warcraft Logs (Optionnel)
                    </span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="glass-card flex flex-col gap-4 p-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Nom du Personnage
                            </label>
                            <input
                                type="text"
                                placeholder="Auto-détecté"
                                value={charName}
                                onChange={(e) => setCharName(e.target.value)}
                                className="w-full rounded-lg bg-white/5 p-2.5 text-sm text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-epic-500/50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Serveur
                            </label>
                            <input
                                type="text"
                                placeholder="ex: Hyjal"
                                value={server}
                                onChange={(e) => setServer(e.target.value)}
                                className="w-full rounded-lg bg-white/5 p-2.5 text-sm text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-epic-500/50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                Région
                            </label>
                            <select
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="w-full rounded-lg bg-void-800 p-2.5 text-sm text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-epic-500/50"
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
                        disabled={!charName || !server || isSearching}
                        className="flex items-center justify-center gap-2 rounded-xl bg-epic-500/10 py-3 text-sm font-bold text-epic-400 ring-1 ring-epic-500/20 transition-all hover:bg-epic-500/20 disabled:pointer-events-none disabled:opacity-40"
                    >
                        {isSearching ? (
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                        Chercher mes rapports récents
                    </button>

                    {/* Search Results */}
                    <AnimatePresence>
                        {searchResults && searchResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 space-y-2 overflow-hidden border-t border-white/5 pt-4"
                            >
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                                    Rapports trouvés
                                </p>
                                <div className="max-h-48 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                                    {searchResults.map((report: any) => (
                                        <button
                                            key={report.code}
                                            onClick={() => handleSelectReport(report)}
                                            className="flex w-full items-center justify-between rounded-lg bg-white/5 p-3 text-left transition-all hover:bg-white/10 ring-1 ring-white/5"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-white">{report.title}</p>
                                                <p className="text-[10px] text-gray-500">{report.zone?.name || "Zone inconnue"}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400">
                                                    {new Date(report.startTime).toLocaleDateString()}
                                                </p>
                                                <ExternalLink className="ml-auto mt-1 h-3 w-3 text-epic-400/50" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Options & Submit */}
            <AnimatePresence>
                {selectedFile && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-6 space-y-4"
                    >
                        {/* Anonymize toggle */}
                        <button
                            onClick={() => setAnonymize(!anonymize)}
                            className="flex w-full items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/5 transition-all hover:bg-white/[0.05] hover:ring-white/10"
                        >
                            <Shield className="h-4 w-4 text-mana-400" />
                            <span className="flex-1 text-left text-sm text-gray-300">
                                Anonymiser les noms des joueurs
                            </span>
                            {anonymize ? (
                                <EyeOff className="h-4 w-4 text-epic-400" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-600" />
                            )}
                        </button>

                        {/* Submit button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isProcessing}
                            className="btn-legendary w-full text-center text-lg"
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="h-5 w-5 animate-spin"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Analyse en cours...
                                </span>
                            ) : (
                                "🚀 Lancer l'analyse IA"
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
