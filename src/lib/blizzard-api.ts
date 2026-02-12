/**
 * Blizzard API Helper
 * Handle OAuth and basic data fetching for World of Warcraft
 */

export async function getBlizzardAccessToken() {
    const clientId = process.env.BLIZZARD_CLIENT_ID;
    const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return null;
    }

    try {
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const response = await fetch("https://oauth.battle.net/token", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        });

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("[Blizzard API] Error getting token:", error);
        return null;
    }
}
