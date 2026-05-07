import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    const { method } = req;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') return res.status(200).end();

    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'silverhand2026';
    const VALID_TOKEN = btoa('admin:' + ADMIN_PASSWORD);

    try {
        if (method === 'POST') {
            const { path } = req.body;
            if (!path) return res.status(400).json({ error: 'Path is required' });

            // Call the SQL function we created
            const { error } = await supabase.rpc('track_visit', { path });
            if (error) throw error;

            return res.status(200).json({ ok: true });
        }

        if (method === 'GET') {
            // Basic auth check for sensitive data
            const authHeader = req.headers.authorization;
            if (authHeader !== VALID_TOKEN) {
                // Also check query param as fallback for simple fetch calls
                const tokenParam = req.query.token;
                if (tokenParam !== VALID_TOKEN) {
                    return res.status(401).json({ error: 'Unauthorized' });
                }
            }

            // Fetch all stats for admin
            const { data, error } = await supabase
                .from('site_stats')
                .select('*')
                .order('visit_count', { ascending: false });

            if (error) throw error;
            return res.status(200).json(data);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('[Stats API] Error:', err);
        return res.status(500).json({ error: err.message });
    }
}
