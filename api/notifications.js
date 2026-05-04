import { put, list } from "@vercel/blob";

const BLOB_PATH = "subscriptions.json";

async function resolveUrl() {
    const result = await list({ prefix: BLOB_PATH, limit: 1 });
    const found = result?.blobs?.find(b => b.pathname === BLOB_PATH);
    return found?.url || null;
}

async function readSubscriptions() {
    const url = await resolveUrl();
    if (!url) return [];
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    try {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
}

async function writeSubscriptions(data) {
    return await put(BLOB_PATH, JSON.stringify(data), {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json",
        allowOverwrite: true
    });
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    try {
        if (req.method === "POST") {
            const { subscription, preferences } = req.body || {};
            if (!subscription) return res.status(400).json({ error: "Missing subscription object" });

            const subscriptions = await readSubscriptions();
            
            // Find if this subscription already exists (checking endpoint)
            const index = subscriptions.findIndex(s => s.subscription.endpoint === subscription.endpoint);
            
            if (index > -1) {
                // Update existing
                subscriptions[index].preferences = preferences;
                subscriptions[index].updatedAt = Date.now();
            } else {
                // Add new
                subscriptions.push({
                    subscription,
                    preferences,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                });
            }

            await writeSubscriptions(subscriptions);
            return res.status(200).json({ ok: true });
        }

        if (req.method === "GET") {
            // For VPS to fetch all subscriptions
            const subscriptions = await readSubscriptions();
            return res.status(200).json({ subscriptions });
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (err) {
        console.error("Notification API Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
