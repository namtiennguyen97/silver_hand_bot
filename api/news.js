// /api/news.js
export default async function handler(req, res) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    try {
        const { url } = req.query;

        if (url) {
            // News Detail View Logic
            const detailRes = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                }
            });
            const html = await detailRes.text();
            
            // Extract Title, Date, and Body with robust greedy patterns
            const titleMatch = html.match(/class="news-list-title"[^>]*>(.*?)<\/div>/is);
            const dateMatch = html.match(/class="news-list-time"[^>]*>(.*?)<\/div>/is);
            
            // Greedily capture from artText or news-txt until we hit the side navigation or footer
            const contentMatch = html.match(/class="(?:artText|news-txt)"[^>]*>(.*?)<div[^>]*class="(?:side|footer_box)"/is);

            let content = contentMatch ? contentMatch[1].trim() : "";
            
            if (!content) {
                // Fallback: try artText or news-txt with simple closing match
                const simpleMatch = html.match(/class="(?:artText|news-txt)"[^>]*>(.*?)<\/div>\s*<\/div>/is);
                content = simpleMatch ? simpleMatch[1].trim() : "Unable to retrieve article content.";
            }

            // Cleanup: remove extra closing tags that might have been caught by greedy match
            content = content.replace(/<\/div>\s*$/i, '');
            content = content.replace(/<\/div>\s*$/i, '');

            // Fix relative paths for images and links
            content = content.replace(/src="\/\//g, 'src="https://');
            content = content.replace(/src="\//g, 'src="https://www.lifeafter.game/');
            content = content.replace(/href="\/\//g, 'href="https://');
            content = content.replace(/href="\//g, 'href="https://www.lifeafter.game/');

            return res.status(200).json({
                title: titleMatch ? titleMatch[1].trim() : "News Update",
                date: dateMatch ? dateMatch[1].trim() : "",
                content: content
            });
        }

        const response = await fetch("https://www.lifeafter.game/news/", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch news: ${response.statusText}`);
        }

        const html = await response.text();
        
        // Parsing news items using Regex based on subagent discovery
        // Target structure:
        // <a href="//www.lifeafter.game/news/update/20260319/32864_1292033.html" title="Maintenance Update3/20">
        //    <i>ANN</i>
        //    <p>
        //        <span>03-19</span> (Date)
        //        <span>Maintenance Update3/20</span> (Title)
        //        <span>Summary...</span> (Summary)
        //    </p>
        // </a>
        
        const newsItems = [];
        
        // Find all <li> items first to isolate each news entry
        const liRegex = /<li>(.*?)<\/li>/gs;
        let liMatch;
        
        while ((liMatch = liRegex.exec(html)) !== null) {
            const liContent = liMatch[1];
            
            // Extract fields from within the <li> content
            const hrefMatch    = liContent.match(/href="([^"]+)"/);
            const titleAttrMatch = liContent.match(/title="([^"]+)"/);
            const categoryMatch = liContent.match(/<i>(.*?)<\/i>/);
            const timeMatch     = liContent.match(/<span[^>]*class="time"[^>]*>(.*?)<\/span>/);
            const titleSpanMatch = liContent.match(/<span[^>]*class="title"[^>]*>(.*?)<\/span>/);
            const commentMatch  = liContent.match(/<span[^>]*class="comment"[^>]*>(.*?)<\/span>/);

            if (hrefMatch && (titleAttrMatch || titleSpanMatch)) {
                let link = hrefMatch[1];
                if (link.startsWith('//')) link = 'https:' + link;
                else if (link.startsWith('/')) link = 'https://www.lifeafter.game' + link;

                newsItems.push({
                    link: link,
                    title: (titleAttrMatch ? titleAttrMatch[1] : (titleSpanMatch ? titleSpanMatch[1] : "No Title")).replace(/&amp;/g, '&'),
                    category: categoryMatch ? categoryMatch[1] : "NEWS",
                    date: timeMatch ? timeMatch[1] : "",
                    summary: commentMatch ? commentMatch[1] : ""
                });
            }
            
            if (newsItems.length >= 15) break;
        }

        // Return empty array if nothing found, but at least we tried robustly
        return res.status(200).json({ news: newsItems });

    } catch (err) {
        console.error("[news] Proxy error:", err);
        return res.status(500).json({ error: "Internal server error", details: err.message });
    }
}
