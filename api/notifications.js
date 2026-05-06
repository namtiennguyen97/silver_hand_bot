import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    try {
        if (req.method === "POST") {
            const { subscription, preferences } = req.body || {};
            if (!subscription || !subscription.endpoint) {
                return res.status(400).json({ error: "Missing subscription endpoint" });
            }

            const { error } = await supabase
                .from('notifications')
                .upsert({ 
                    endpoint: subscription.endpoint, 
                    subscription, 
                    preferences,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'endpoint' });

            if (error) throw error;

            return res.status(200).json({ ok: true });
        }

        if (req.method === "GET") {
            // For VPS to fetch all subscriptions
            const { data, error } = await supabase
                .from('notifications')
                .select('*');

            if (error) throw error;

            return res.status(200).json({ subscriptions: data || [] });
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (err) {
        console.error("Notification API Error:", err);
        return res.status(500).json({ error: "Internal server error", message: err.message });
    }
}
