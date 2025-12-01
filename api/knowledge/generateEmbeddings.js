import fs from "fs";
import path from "path";
import OpenAI from "openai";
import "dotenv/config";


const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
    try {
        const knowledgePath = path.join(process.cwd(), "api", "knowledge", "knowledge.json");
        const outputPath   = path.join(process.cwd(), "api", "knowledge", "embedding.json");

        // 1. Đọc knowledge.json
        if (!fs.existsSync(knowledgePath)) {
            console.error("❌ knowledge.json not found at:", knowledgePath);
            return;
        }

        const raw = fs.readFileSync(knowledgePath, "utf8");
        const items = JSON.parse(raw);

        console.log(`📚 Loading ${items.length} knowledge items...`);

        const result = [];

        for (const item of items) {
            console.log(`→ Embedding: ${item.title} ...`);

            const response = await client.embeddings.create({
                model: "text-embedding-3-small",
                input: `${item.title}\n${item.content}`,
            });

            if (!response?.data || !response.data[0]?.embedding) {
                console.error("❌ API ERROR:", response);
                throw new Error("Embedding API returned invalid response");
            }

            result.push({
                ...item,
                embedding: response.data[0].embedding,
            });
        }

        // 3. Ghi file
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
        console.log(`✅ DONE → embedding.json created (${result.length} items)`);

    } catch (err) {
        console.error("❌ Script failed:", err);
    }
}

main();
