import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

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
        note: typeof body.note === "string" ? body.note.trim() : null,
        updatedAt: Number(body.updatedAt) || Date.now()
    };
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
                const { data, error } = await supabase
                    .from('ctc_plans')
                    .select('*')
                    .eq('name', workspaceName)
                    .single();

                if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'No rows found'
                
                if (!data) return res.status(200).json({ ok: true, data: null });

                const payload = data.data;

                // Verify password if set
                if (payload.password && payload.password !== providedPassword) {
                    return res.status(200).json({
                        ok: true,
                        data: { requiresPassword: true }
                    });
                }

                // Remove password from returned data for security
                delete payload.password;

                return res.status(200).json({
                    ok: true,
                    data: payload
                });
            } else {
                // List all workspaces
                const { data, error } = await supabase
                    .from('ctc_plans')
                    .select('name, updated_at, data')
                    .order('updated_at', { ascending: false });

                if (error) throw error;

                const workspaces = (data || []).map(row => ({
                    name: row.name,
                    displayName: row.name === "Main-Plan" ? "Public Plan" : row.name,
                    uploadedAt: row.updated_at,
                    protected: !!row.data.password,
                    note: row.data.note
                }));

                return res.status(200).json({
                    ok: true,
                    data: workspaces
                });
            }
        }

        if (req.method === "POST") {
            if (!workspaceName) {
                return res.status(400).json({ ok: false, error: "Missing workspace name" });
            }

            const payload = sanitizePayload(req.body);
            
            const { error } = await supabase
                .from('ctc_plans')
                .upsert({ 
                    name: workspaceName, 
                    data: payload,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'name' });

            if (error) throw error;

            return res.status(200).json({
                ok: true,
                data: payload
            });
        }

        if (req.method === "DELETE") {
            if (!workspaceName) {
                return res.status(400).json({ ok: false, error: "Missing workspace name" });
            }

            const { error } = await supabase
                .from('ctc_plans')
                .delete()
                .eq('name', workspaceName);

            if (error) throw error;

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