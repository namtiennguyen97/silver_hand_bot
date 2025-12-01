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
        const { messages } = req.body || {};
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Invalid request: messages array required" });
        }

        const userMessage = getLastUserMessage(messages);
        if (!userMessage) return res.status(400).json({ error: "No user message found" });

        // ===== Debug logs (will appear in Vercel function logs) =====
        console.log("[chat] userMessage:", userMessage.slice(0, 500));

        // 1) create embedding for user message
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
            console.error("[chat] Embedding API error:", t);
            return res.status(502).json({ error: "Embedding API error", details: t });
        }
        const embJson = await embResp.json();
        const userEmbedding = embJson?.data?.[0]?.embedding;
        if (!userEmbedding) {
            console.error("[chat] embedding missing in response:", JSON.stringify(embJson).slice(0, 500));
            return res.status(502).json({ error: "Invalid embedding response", details: embJson });
        }

        // 2) score knowledge items
        const scored = knowledge.map(item => {
            const score = Array.isArray(item.embedding) ? cosineSim(userEmbedding, item.embedding) : 0;
            return { ...item, score };
        });

        // sort and pick top N
        const topN = 3;
        const top = scored.sort((a, b) => b.score - a.score).slice(0, topN);

        console.log("[chat] top matches (title -> score):");
        top.forEach(ti => console.log(`  - ${ti.title} -> ${ti.score.toFixed(4)}`));

        // 3) threshold: if top score too low, don't include knowledge
        const SCORE_THRESHOLD = 0.10; // adjust if needed (0.1 is conservative)
        const includeKnowledge = top[0] && top[0].score >= SCORE_THRESHOLD;

        const knowledgeText = includeKnowledge ? top.map(k => `• ${k.title}\n${k.content}`).join("\n\n") : "";
        console.log("[chat] includeKnowledge:", includeKnowledge);

        // debug: log snippet of knowledgeText
        if (includeKnowledge) console.log("[chat] knowledgeText snippet:", knowledgeText.slice(0, 600));

        // 4) merge into single system message (systemPrompt + knowledge)
        const mergedSystem = {
            role: "system",
            content: includeKnowledge ? `${systemPrompt.content}\n\nKIẾN THỨC LIÊN QUAN:\n${knowledgeText}` : systemPrompt.content
        };

        // 5) build final messages: mergedSystem + conversation
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
                max_tokens: 800
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
