// /api/chat.js
import knowledge from "./knowledge/embedding.json" with { type: "json" };
import { systemPrompt } from "../server/systemPrompt.js";

// cosine similarity
function dot(A, B) {
    let s = 0;
    for (let i = 0; i < A.length; i++) s += A[i] * B[i];
    return s;
}
function mag(A) {
    return Math.sqrt(A.reduce((acc, v) => acc + v * v, 0));
}
function cosineSim(A, B) {
    const mA = mag(A), mB = mag(B);
    if (!mA || !mB) return 0;
    return dot(A, B) / (mA * mB);
}

// get last user message safely
function getLastUserMessage(messages) {
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i] && messages[i].role === "user" && typeof messages[i].content === "string" && messages[i].content.trim()) {
            return messages[i].content.trim();
        }
    }
    // fallback: last message content if nothing else
    return (messages[messages.length - 1] && messages[messages.length - 1].content) || "";
}

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const { messages, systemOverride } = req.body || {};
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Invalid request: messages array required" });
        }

        let mergedSystem;

        if (systemOverride) {
            // 1) Use override if specified (skip knowledge search)
            mergedSystem = { role: "system", content: systemOverride };
        } else {
            // 2) Original RPG Chat flows: search knowledge
            const userMessage = getLastUserMessage(messages);
            if (!userMessage) return res.status(400).json({ error: "No user message found" });
            
            console.log("[chat] userMessage:", userMessage.slice(0, 500));

            // a) create embedding
            const embResp = await fetch("https://api.openai.com/v1/embeddings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "text-embedding-3-small",
                    input: userMessage
                })
            });

            if (!embResp.ok) {
                const t = await embResp.text();
                return res.status(502).json({ error: "Embedding API error", details: t });
            }
            const embJson = await embResp.json();
            const userEmbedding = embJson?.data?.[0]?.embedding;

            // b) score knowledge
            const scored = knowledge.map(item => {
                const score = Array.isArray(item.embedding) ? cosineSim(userEmbedding, item.embedding) : 0;
                return { ...item, score };
            });
            const top = scored.sort((a, b) => b.score - a.score).slice(0, 3);

            // c) threshold & merge
            const SCORE_THRESHOLD = 0.10;
            const includeKnowledge = top[0] && top[0].score >= SCORE_THRESHOLD;
            const knowledgeText = includeKnowledge ? top.map(k => `• ${k.title}\n${k.content}`).join("\n\n") : "";
            
            mergedSystem = {
                role: "system",
                content: includeKnowledge ? `${systemPrompt.content}\n\nKIẾN THỨC LIÊN QUAN:\n${knowledgeText}` : systemPrompt.content
            };
        }

        const finalMessages = [mergedSystem, ...messages];

        // 6) send to chat completions
        const chatResp = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: finalMessages,
                max_tokens: 4000
            })
        });

        const chatJson = await chatResp.json();
        if (!chatResp.ok) {
            console.error("[chat] Chat API error:", JSON.stringify(chatJson).slice(0, 1000));
            return res.status(502).json({ error: "Chat API error", details: chatJson });
        }

        // 7) return the OpenAI response directly
        return res.status(200).json(chatJson);

    } catch (err) {
        console.error("[chat] Server error:", err);
        return res.status(500).json({ error: "Internal server error", details: err.message });
    }
}
