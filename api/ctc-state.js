import { put, list, del } from "@vercel/blob";

const WORKSPACE_PREFIX = "ctc/workspace-";
const CATEGORIES = [
    "Attack team 1",
    "Beacon team 2",
    "Free run",
    "Destroying their base"
];

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
        password: typeof body.password === "string" ? body.password.trim() : null, // 6 digits
        masterPlayers,
        pool,
        categories: cleanedCategories,
        updatedAt: Number(body.updatedAt) || Date.now()
    };
}

async function getWorkspaceUrl(workspaceName) {
    const pathname = workspaceName === "Main-Plan" ? "ctc-shared-state.json" : `${WORKSPACE_PREFIX}${workspaceName}.json`;
    const result = await list({
        prefix: pathname,
        limit: 1
    });
    const found = result?.blobs?.find(b => b.pathname === pathname);
    return found?.url || null;
}

async function readWorkspace(workspaceName) {
    const url = await getWorkspaceUrl(workspaceName);
    if (!url) return null;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    return await res.json();
}

async function writeWorkspace(workspaceName, payload) {
    const pathname = workspaceName === "Main-Plan" ? "ctc-shared-state.json" : `${WORKSPACE_PREFIX}${workspaceName}.json`;
    const json = JSON.stringify(payload);

    const blob = await put(pathname, json, {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json; charset=utf-8",
        allowOverwrite: true
    });

    return blob;
}

async function listWorkspaces() {
    const result = await list({
        prefix: WORKSPACE_PREFIX
    });

    const workspaces = await Promise.all(result.blobs.map(async b => {
        const name = b.pathname.replace(WORKSPACE_PREFIX, "").replace(".json", "");
        
        // Peek at content to check if protected (Best effort)
        let protectedWorkspace = false;
        try {
            const data = await (await fetch(b.url, { cache: "no-store" })).json();
            if (data.password) protectedWorkspace = true;
        } catch (e) {}

        return {
            name,
            pathname: b.pathname,
            uploadedAt: b.uploadedAt,
            size: b.size,
            protected: protectedWorkspace
        };
    }));

    // Legacy check
    const legacyResult = await list({ prefix: "ctc-shared-state.json", limit: 1 });
    const legacyBlob = legacyResult?.blobs?.find(b => b.pathname === "ctc-shared-state.json");
    if (legacyBlob && !workspaces.find(w => w.name === "Main-Plan")) {
        let legacyProtected = false;
        try {
            const data = await (await fetch(legacyBlob.url, { cache: "no-store" })).json();
            if (data.password) legacyProtected = true;
        } catch (e) {}

        workspaces.push({
            name: "Main-Plan",
            pathname: legacyBlob.pathname,
            uploadedAt: legacyBlob.uploadedAt,
            size: legacyBlob.size,
            isLegacy: true,
            protected: legacyProtected
        });
    }

    return workspaces;
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const workspaceName = searchParams.get("workspace");
    const providedPassword = searchParams.get("password");

    try {
        if (req.method === "GET") {
            if (workspaceName) {
                const data = await readWorkspace(workspaceName);
                if (!data) return res.status(200).json({ ok: true, data: null });

                // Verify password if set
                if (data.password && data.password !== providedPassword) {
                    return res.status(200).json({
                        ok: true,
                        data: { requiresPassword: true }
                    });
                }

                // Remove password from returned data for security
                delete data.password;

                return res.status(200).json({
                    ok: true,
                    data: data
                });
            } else {
                const list = await listWorkspaces();
                return res.status(200).json({
                    ok: true,
                    data: list
                });
            }
        }

        if (req.method === "POST") {
            if (!workspaceName) {
                return res.status(400).json({ ok: false, error: "Missing workspace name" });
            }

            const payload = sanitizePayload(req.body);
            await writeWorkspace(workspaceName, payload);

            return res.status(200).json({
                ok: true,
                data: payload
            });
        }

        if (req.method === "DELETE") {
            if (!workspaceName) {
                return res.status(400).json({ ok: false, error: "Missing workspace name" });
            }
            const url = await getWorkspaceUrl(workspaceName);
            if (url) {
                await del(url);
            }
            return res.status(200).json({ ok: true });
        }

        return res.status(405).json({
            ok: false,
            error: "Method not allowed"
        });
    } catch (error) {
        console.error("ctc-state API error:", error);
        return res.status(500).json({
            ok: false,
            error: error.message || "Internal server error"
        });
    }
}