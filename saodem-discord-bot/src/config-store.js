import fs from "node:fs";
import { configPath } from "./paths.js";

const DEFAULT_CONFIG = {
    enabled: true,
    channelId: "",
    roleId: "",
    mentionEveryone: false,
    timezone: process.env.BOT_TIMEZONE || "Asia/Bangkok",
};

export function loadConfig() {
    if (!fs.existsSync(configPath)) {
        saveConfig(DEFAULT_CONFIG);
        return { ...DEFAULT_CONFIG };
    }

    const raw = fs.readFileSync(configPath, "utf8");
    const parsed = JSON.parse(raw);
    return {
        ...DEFAULT_CONFIG,
        ...parsed,
        timezone: parsed.timezone || process.env.BOT_TIMEZONE || DEFAULT_CONFIG.timezone,
    };
}

export function saveConfig(config) {
    fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export function updateConfig(patch) {
    const config = {
        ...loadConfig(),
        ...patch,
    };
    saveConfig(config);
    return config;
}
