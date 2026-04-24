import { put, list, del } from '@vercel/blob';

export const config = {
  runtime: 'nodejs',
};

const METADATA_PATH = 'blog/metadata.json';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { method } = req;

    try {
        if (method === 'GET') {
            const { blobs } = await list({ prefix: METADATA_PATH });
            if (blobs.length === 0) {
                return res.status(200).json([]);
            }
            // Find the one that matches METADATA_PATH exactly or just the latest
            const latest = blobs.find(b => b.pathname === METADATA_PATH) || blobs[0];
            const response = await fetch(latest.url);
            const data = await response.json();
            return res.status(200).json(data);
        }

        if (method === 'POST') {
            const { title, category, description, imageBase64, imageName } = req.body;
            
            let imageUrl = '';
            if (imageBase64) {
                const buffer = Buffer.from(imageBase64.split(',')[1], 'base64');
                const randomId = Math.random().toString(36).substring(2, 7);
                const blob = await put(`blog/images/${Date.now()}-${randomId}-${imageName || 'image.png'}`, buffer, {
                    access: 'public',
                });
                imageUrl = blob.url;
            }

            let posts = [];
            const { blobs } = await list({ prefix: METADATA_PATH });
            const existingBlob = blobs.find(b => b.pathname === METADATA_PATH);
            if (existingBlob) {
                const resp = await fetch(existingBlob.url);
                posts = await resp.json();
            }

            const newPost = {
                id: Date.now().toString(),
                title: title || 'No Title',
                category: category || 'General',
                description: description || '',
                imageUrl,
                createdAt: new Date().toISOString(),
            };

            posts.unshift(newPost);

            await put(METADATA_PATH, JSON.stringify(posts), {
                access: 'public',
                addRandomSuffix: false,
                addOverwrite: true,
                allowOverwrite: true, // Thêm cả 2 để đảm bảo tương thích
            });

            return res.status(201).json(newPost);
        }

        if (method === 'PUT') {
            const { id, title, category, description, imageBase64, imageName } = req.body;
            
            const { blobs } = await list({ prefix: METADATA_PATH });
            const existingBlob = blobs.find(b => b.pathname === METADATA_PATH);
            if (!existingBlob) return res.status(404).json({ error: 'Metadata not found' });
            
            const resp = await fetch(existingBlob.url);
            let posts = await resp.json();

            const postIndex = posts.findIndex(p => p.id === id);
            if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });

            if (imageBase64) {
                // Try to delete old image if it's a blob URL
                if (posts[postIndex].imageUrl && posts[postIndex].imageUrl.includes('public.blob.vercel-storage.com')) {
                    try { await del(posts[postIndex].imageUrl); } catch(e) { console.error("Del error", e); }
                }
                const buffer = Buffer.from(imageBase64.split(',')[1], 'base64');
                const randomId = Math.random().toString(36).substring(2, 7);
                const blob = await put(`blog/images/${Date.now()}-${randomId}-${imageName || 'image.png'}`, buffer, { access: 'public' });
                posts[postIndex].imageUrl = blob.url;
            }

            posts[postIndex] = {
                ...posts[postIndex],
                title: title || posts[postIndex].title,
                category: category || posts[postIndex].category,
                description: description || posts[postIndex].description,
                updatedAt: new Date().toISOString(),
            };

            await put(METADATA_PATH, JSON.stringify(posts), {
                access: 'public',
                addRandomSuffix: false,
                addOverwrite: true,
                allowOverwrite: true,
            });

            return res.status(200).json(posts[postIndex]);
        }

        if (method === 'DELETE') {
            const { id } = req.query;
            
            const { blobs } = await list({ prefix: METADATA_PATH });
            const existingBlob = blobs.find(b => b.pathname === METADATA_PATH);
            if (!existingBlob) return res.status(404).json({ error: 'Metadata not found' });
            
            const resp = await fetch(existingBlob.url);
            let posts = await resp.json();

            const postIndex = posts.findIndex(p => p.id === id);
            if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });

            const post = posts[postIndex];

            // Delete image
            if (post.imageUrl && post.imageUrl.includes('public.blob.vercel-storage.com')) {
                try { await del(post.imageUrl); } catch(e) { console.error("Del error", e); }
            }

            posts.splice(postIndex, 1);

            await put(METADATA_PATH, JSON.stringify(posts), {
                access: 'public',
                addRandomSuffix: false,
                addOverwrite: true,
                allowOverwrite: true,
            });

            return res.status(200).json({ message: 'Deleted' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Blog API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
