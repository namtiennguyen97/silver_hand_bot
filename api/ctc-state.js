import { put, list } from "@vercel/blob";

const BLOB_PATH = "ctc-shared-state.json";
const CATEGORIES = [
    "Attack team 1",
    "Beacon team 2",
    "Free run",
    "Destroying their base"
];

// Lưu URL blob hiện tại trong memory của serverless instance (best effort)
let cachedBlobUrl = null;

function isArray(v) {
    return Array.isArray(v);
}

function sanitizePayload(body) {
    if (!body || typeof body !== "object") {
        throw new Error("Invalid body");
    }

    const masterPlayers = isArray(body.masterPlayers) ? body.masterPlayers : [];
    const pool = isArray(body.pool) ? body.pool : [];
    const categories = body.categories && typeof body.categories === "object" ? body.categories : {};

    const cleanedCategories = {};
    for (const cat of CATEGORIES) {
        cleanedCategories[cat] = isArray(categories[cat]) ? categories[cat] : [];
    }

    return {
        version: 1,
        masterPlayers,
        pool,
        categories: cleanedCategories,
        updatedAt: Number(body.updatedAt) || Date.now()
    };
}

async function resolveBlobUrl() {
    if (cachedBlobUrl) return cachedBlobUrl;

    const result = await list({
        prefix: BLOB_PATH,
        limit: 1
    });

    const found = result?.blobs?.find(b => b.pathname === BLOB_PATH);

    if (found?.url) {
        cachedBlobUrl = found.url;
        return found.url;
    }

    return null;
}

async function readSharedState() {
    const url = await resolveBlobUrl();
    if (!url) return null;

    const res = await fetch(url, {
        cache: "no-store"
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch blob content: ${res.status}`);
    }

    return await res.json();
}

async function writeSharedState(payload) {
    const json = JSON.stringify(payload);

    const blob = await put(BLOB_PATH, json, {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json; charset=utf-8",
        allowOverwrite: true
    });

    cachedBlobUrl = blob.url;
    return blob;
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        if (req.method === "GET") {
            const data = await readSharedState();

            return res.status(200).json({
                ok: true,
                data: data || null
            });
        }

        if (req.method === "POST") {
            const payload = sanitizePayload(req.body);

            await writeSharedState(payload);

            return res.status(200).json({
                ok: true,
                data: payload
            });
        }

        return res.status(405).json({
            ok: false,
            error: "Method not allowed"
        });
    } catch (error) {
        console.error("ctc-state API error:", error);

        return res.status(500).json({
            ok: false,
            error: "Internal server error"
        });
    }
}