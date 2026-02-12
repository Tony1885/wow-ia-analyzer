// ============================================================
// Warcraft Logs API v2 Fetcher
// Handles OAuth and GraphQL queries to fetch parse and rank data
// ============================================================

export interface WCLRankingData {
    encounterId: number;
    encounterName: string;
    rank: number;
    outOf: number;
    percentile: number;
    amount: number;
    spec: string;
}

/**
 * Fetches ranking data from Warcraft Logs for a specific character
 */
export async function fetchWCLRankings(
    characterName: string,
    serverSlug: string,
    region: string
): Promise<WCLRankingData[] | null> {
    const clientId = process.env.WCL_CLIENT_ID;
    const clientSecret = process.env.WCL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.warn("[WCL] Missing API credentials. Skipping WCL data fetch.");
        return null;
    }

    try {
        // 1. Get Access Token
        const tokenRes = await fetch("https://www.warcraftlogs.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
        });

        if (!tokenRes.ok) throw new Error("Failed to get WCL token");
        const { access_token } = await tokenRes.json();

        // 2. Query Rankings via GraphQL (v2 API)
        const query = `
            query {
                characterData {
                    character(name: "${characterName}", serverSlug: "${serverSlug}", serverRegion: "${region}") {
                        zoneRankings
                    }
                }
            }
        `;

        const apiRes = await fetch("https://www.warcraftlogs.com/api/v2/client", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`,
            },
            body: JSON.stringify({ query }),
        });

        if (!apiRes.ok) throw new Error("WCL API request failed");
        const data = await apiRes.json();

        if (data.errors) {
            console.error("[WCL] GraphQL Errors:", data.errors);
            return null;
        }

        const zoneRankings = data.data?.characterData?.character?.zoneRankings;
        if (!zoneRankings || !zoneRankings.rankings) return [];

        // Map WCL v2 rankings to our interface
        return zoneRankings.rankings.map((r: any) => ({
            encounterId: r.encounter?.id,
            encounterName: r.encounter?.name,
            rank: r.rank,
            outOf: r.outOf,
            percentile: r.rankPercent,
            amount: r.amount,
            spec: r.spec
        }));
    } catch (error) {
        console.error("[WCL] Error fetching rankings:", error);
        return null;
    }
}

/**
 * Gets an OAuth2 access token from Warcraft Logs
 */
async function getWCLAccessToken(): Promise<string | null> {
    const clientId = process.env.WCL_CLIENT_ID;
    const clientSecret = process.env.WCL_CLIENT_SECRET || process.env.KEY_WACRAFTLOGS;

    if (!clientId || !clientSecret) {
        console.warn("[WCL] Missing Client ID or Secret/Key. Check WCL_CLIENT_ID and WCL_CLIENT_SECRET (or KEY_WACRAFTLOGS).");
        return null;
    }

    try {
        const res = await fetch("https://www.warcraftlogs.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
        });
        if (!res.ok) {
            console.error("[WCL] Auth Failed:", await res.text());
            return null;
        }
        const { access_token } = await res.json();
        return access_token;
    } catch (error) {
        console.error("[WCL] Token Error:", error);
        return null;
    }
}

/**
 * Fetches recent reports for a character
 */
export async function fetchCharacterReports(
    name: string,
    serverSlug: string,
    region: string
): Promise<any[]> {
    const token = await getWCLAccessToken();
    if (!token) return [];

    const query = `
        query {
            characterData {
                character(name: "${name}", serverSlug: "${serverSlug}", serverRegion: "${region}") {
                    id
                    recentReports(limit: 10) {
                        data {
                            code
                            startTime
                            title
                            zone { name }
                        }
                    }
                }
            }
        }
    `;

    try {
        const res = await fetch("https://www.warcraftlogs.com/api/v2/client", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ query }),
        });
        const data = await res.json();
        return data.data?.characterData?.character?.recentReports?.data || [];
    } catch (e) {
        console.error("[WCL] Error fetching reports:", e);
        return [];
    }
}

/**
 * Slugifies server names for WCL API (e.g. "Chamber of Aspects" -> "chamber-of-aspects")
 */
export function slugifyServer(server: string): string {
    return server
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/\s+/g, "-")            // Spaces to hyphens
        .replace(/[^\w-]/g, "");         // Remove non-alphanumeric
}
