import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { password } = req.body;

    try {
        // Query password từ Supabase
        const { data, error } = await supabase
            .from('admin_users')
            .select('passcode')
            .eq('username', 'admin')
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        // Mật khẩu mặc định nếu chưa có record hoặc lỗi fetch
        const dbPasscode = data?.passcode || '10101997';

        if (password === dbPasscode) {
            // Tạo token dựa trên mật khẩu đúng
            const token = btoa('admin:' + dbPasscode); 
            return res.status(200).json({ ok: true, token });
        } else {
            return res.status(401).json({ ok: false, error: 'Unauthorized' });
        }
    } catch (err) {
        console.error('Auth Error:', err);
        return res.status(500).json({ error: 'Database connection failed' });
    }
}
