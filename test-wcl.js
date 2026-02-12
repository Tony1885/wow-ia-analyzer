const fetch = require('node-fetch');

async function testWCL() {
    const clientId = "88934fa7-889d-4034-8b63-9528646b1076"; // From previous context if I find it, or I use process.env
    const clientSecret = "pGq864T4R0Yst6fD6OqUaR9qVw0G9S6178877S9f"; // Mock or real from env

    // For this test, I'll try to use the ones from the environment if available
    require('dotenv').config({ path: '.env.local' });

    const CID = process.env.WCL_CLIENT_ID;
    const SEC = process.env.WCL_CLIENT_SECRET || process.env.KEY_WACRAFTLOGS;

    console.log("Using CID:", CID);

    const tokenRes = await fetch("https://www.warcraftlogs.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=client_credentials&client_id=${CID}&client_secret=${SEC}`,
    });
    const { access_token } = await tokenRes.json();
    console.log("Token obtained:", !!access_token);

    const charName = "Moussman";
    const serverSlug = "ysondre";
    const region = "EU";

    const query = `
        query {
            characterData {
                character(name: "${charName}", serverSlug: "${serverSlug}", serverRegion: "${region}") {
                    id
                    name
                    recentReports(limit: 10) {
                        data {
                            code
                            title
                        }
                    }
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

    const data = await apiRes.json();
    console.log("Response:", JSON.stringify(data, null, 2));
}

testWCL();
