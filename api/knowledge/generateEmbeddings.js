import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    try {
        const knowledgePath = path.join(process.cwd(), "api/knowledge/knowledge.json");
        const knowledge = JSON.parse(fs.readFileSync(knowledgePath, "utf8"));

        const results = [];

        for (const item of knowledge) {
            const embedRes = await fetch("https://api.openai.com/v1/embeddings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "text-embedding-3-small",
                    input: item.content
                })
            });

            const data = await embedRes.json();
            results.push({
                ...item,
                embedding: data.data[0].embedding
            });
        }

        const embedPath = path.join(process.cwd(), "api/knowledge/embedding.json");
        fs.writeFileSync(embedPath, JSON.stringify(results, null, 2));

        res.json({ success: true, count: results.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate embeddings", details: err.message });
    }
}
