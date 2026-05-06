import { put, del } from '@vercel/blob';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export const config = {
  runtime: 'nodejs',
};

// Helper to map DB record to Frontend object
function mapPost(post) {
    return {
        id: post.id.toString(),
        title: post.title,
        category: post.category,
        description: post.description,
        imageUrl: post.image_url,
        isFeatured: post.is_featured,
        views: post.views,
        createdAt: post.created_at,
        updatedAt: post.updated_at
    };
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { method } = req;

    try {
        if (method === 'GET') {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return res.status(200).json((data || []).map(mapPost));
        }

        if (method === 'POST') {
            const { title, category, description, imageBase64, imageName, isFeatured } = req.body;
            
            let imageUrl = '';
            if (imageBase64) {
                const buffer = Buffer.from(imageBase64.split(',')[1], 'base64');
                const randomId = Math.random().toString(36).substring(2, 7);
                const blob = await put(`blog/images/${Date.now()}-${randomId}-${imageName || 'image.png'}`, buffer, {
                    access: 'public',
                });
                imageUrl = blob.url;
            }

            const { data, error } = await supabase
                .from('blog_posts')
                .insert({
                    title: title || 'No Title',
                    category: category || 'General',
                    description: description || '',
                    image_url: imageUrl,
                    is_featured: isFeatured || false,
                    views: 0
                })
                .select()
                .single();

            if (error) throw error;
            return res.status(201).json(mapPost(data));
        }

        if (method === 'PUT') {
            const { id, title, category, description, imageBase64, imageName, isFeatured } = req.body;
            
            const { data: current, error: fetchError } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) return res.status(404).json({ error: 'Post not found' });

            let imageUrl = current.image_url;
            if (imageBase64) {
                if (imageUrl && imageUrl.includes('public.blob.vercel-storage.com')) {
                    try { await del(imageUrl); } catch(e) {}
                }
                const buffer = Buffer.from(imageBase64.split(',')[1], 'base64');
                const randomId = Math.random().toString(36).substring(2, 7);
                const blob = await put(`blog/images/${Date.now()}-${randomId}-${imageName || 'image.png'}`, buffer, { access: 'public' });
                imageUrl = blob.url;
            }

            const { data, error } = await supabase
                .from('blog_posts')
                .update({
                    title: title || current.title,
                    category: category || current.category,
                    description: description || current.description,
                    image_url: imageUrl,
                    is_featured: isFeatured !== undefined ? isFeatured : current.is_featured,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return res.status(200).json(mapPost(data));
        }

        if (method === 'DELETE') {
            const { id } = req.query;
            const { data: post, error: fetchError } = await supabase.from('blog_posts').select('image_url').eq('id', id).single();
            if (fetchError) return res.status(404).json({ error: 'Post not found' });

            if (post.image_url && post.image_url.includes('public.blob.vercel-storage.com')) {
                try { await del(post.image_url); } catch(e) {}
            }

            const { error } = await supabase.from('blog_posts').delete().eq('id', id);
            if (error) throw error;
            return res.status(200).json({ message: 'Deleted' });
        }

        if (method === 'PATCH') {
            const { id } = req.body;
            const { data, error: fetchError } = await supabase.from('blog_posts').select('views').eq('id', id).single();
            if (fetchError) throw fetchError;

            const { data: updated, error } = await supabase
                .from('blog_posts')
                .update({ views: (data.views || 0) + 1 })
                .eq('id', id)
                .select('views')
                .single();

            if (error) throw error;
            return res.status(200).json({ views: updated.views });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Blog API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
