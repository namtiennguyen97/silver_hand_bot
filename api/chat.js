import { systemPrompt } from "../config/systemPrompt.js";
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { messages } = await req.json ? await req.json() : req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Invalid request" });
        }

        // 🧠 Thêm systemPrompt vào đầu danh sách
        const finalMessages = [systemPrompt, ...messages];

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                // model: "gpt-3.5-turbo",
                model: "gpt-4o-mini",
                messages: finalMessages,
                max_tokens: 800
            })
        });

        if (!response.ok) {
            const text = await response.text();
            return res.status(502).json({ error: "Upstream API error", details: text });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
