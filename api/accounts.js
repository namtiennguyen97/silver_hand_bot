import { put, list } from "@vercel/blob";

const BLOB_PATH = "accounts.json";

async function resolveAccountsUrl() {
    const result = await list({ prefix: BLOB_PATH, limit: 1 });
    const found = result?.blobs?.find(b => b.pathname === BLOB_PATH);
    return found?.url || null;
}

async function readAccounts() {
    const url = await resolveAccountsUrl();
    if (!url) return { accounts: [] };
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { accounts: [] };
    try {
        return await res.json();
    } catch (e) {
        return { accounts: [] };
    }
}

async function writeAccounts(data) {
    return await put(BLOB_PATH, JSON.stringify(data), {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json",
        allowOverwrite: true
    });
}

export default async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    try {
        const { action, username, passcode, avatar } = req.body || {};

        if (req.method === "POST") {
            const data = await readAccounts();

            if (action === "register") {
                if (!username || !passcode) return res.status(400).json({ error: "Missing info" });
                
                // Simple check
                const accountList = data.accounts || [];
                if (accountList.find(a => a.username === username)) {
                    return res.status(400).json({ error: "Account already exists" });
                }

                let finalAvatarUrl = avatar || "assets/img/mayor_avatar.jpg";

                // If avatar is base64, upload it to blob
                if (avatar && avatar.startsWith("data:image")) {
                    const mimeType = avatar.match(/data:([^;]+);/)?.[1] || "image/png";
                    const extension = mimeType.split("/")[1] || "png";
                    const base64Data = avatar.split(",")[1];
                    const buffer = Buffer.from(base64Data, "base64");
                    const filename = `avatars/${username}_${Date.now()}.${extension}`;
                    
                    const avatarBlob = await put(filename, buffer, {
                        access: "public",
                        contentType: mimeType
                    });
                    finalAvatarUrl = avatarBlob.url;
                }

                const newUser = {
                    username,
                    passcode, 
                    avatar: finalAvatarUrl,
                    createdAt: Date.now()
                };

                accountList.push(newUser);
                data.accounts = accountList;
                await writeAccounts(data);
                return res.status(200).json({ ok: true, user: newUser });
            }

            if (action === "login") {
                const user = data.accounts.find(a => a.username === username && a.passcode === passcode);
                if (user) {
                    return res.status(200).json({ ok: true, user });
                } else {
                    return res.status(401).json({ error: "Invalid credentials" });
                }
            }
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (err) {
        console.error("Account API Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
