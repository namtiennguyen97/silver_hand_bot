import { put, list } from "@vercel/blob";

const BLOB_PATH = "camp_global.json";

async function resolveGlobalUrl() {
    const result = await list({ prefix: BLOB_PATH, limit: 1 });
    const found = result?.blobs?.find(b => b.pathname === BLOB_PATH);
    return found?.url || null;
}

async function readGlobal() {
    const url = await resolveGlobalUrl();
    if (!url) return { totalCredits: 0, donors: [], systemBuff: null };
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { totalCredits: 0, donors: [], systemBuff: null };
    try {
        return await res.json();
    } catch (e) {
        return { totalCredits: 0, donors: [], systemBuff: null };
    }
}

async function writeGlobal(data) {
    return await put(BLOB_PATH, JSON.stringify(data), {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json",
        allowOverwrite: true
    });
}

export default async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    try {
        const data = await readGlobal();

        if (req.method === "GET") {
            return res.status(200).json(data);
        }

        if (req.method === "POST") {
            const { action, amount, username, avatar } = req.body || {};

            if (action === "donate") {
                if (!amount || isNaN(amount)) return res.status(400).json({ error: "Invalid amount" });

                data.totalCredits = (data.totalCredits || 0) + parseInt(amount);

                // Add to donors list
                const newDonor = {
                    username: username || "Anonymous",
                    avatar: avatar || "assets/img/mayor_avatar.jpg",
                    amount: parseInt(amount),
                    time: Date.now()
                };

                data.donors = [newDonor, ...(data.donors || [])].slice(0, 10); // Keep last 10

                // Check for buff thresholds (example: every 1 million)
                // Just a placeholder logic
                if (data.totalCredits > 10000000) {
                     data.systemBuff = { type: "FEVER", multiplier: 2, endAt: Date.now() + 3600000 };
                }

                await writeGlobal(data);
                return res.status(200).json({ ok: true, data });
            }
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (err) {
        console.error("Camp API Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
