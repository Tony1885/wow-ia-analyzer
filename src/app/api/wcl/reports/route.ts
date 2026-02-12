import { NextRequest, NextResponse } from "next/server";
import { fetchCharacterReports, slugifyServer } from "@/lib/wcl-api";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const server = searchParams.get("server");
    const region = searchParams.get("region");

    if (!name || !server || !region) {
        return NextResponse.json({ success: false, error: "Paramètres manquants" }, { status: 400 });
    }

    try {
        const reports = await fetchCharacterReports(name, slugifyServer(server), region);
        return NextResponse.json({ success: true, reports });
    } catch (error) {
        console.error("[API] Error fetching reports:", error);
        return NextResponse.json({ success: false, error: "Erreur lors de la récupération des rapports" }, { status: 500 });
    }
}
