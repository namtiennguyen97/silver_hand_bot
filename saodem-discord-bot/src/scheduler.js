import { DateTime } from "luxon";
import { loadConfig } from "./config-store.js";
import { loadEvents } from "./event-store.js";
import { formatReminderMessage } from "./message-format.js";

const sentKeys = new Set();

function reminderKey(now, eventId, reminder) {
    return `${now.toISODate()}|${eventId}|${reminder.time}`;
}

function isReminderDue(now, reminder) {
    return now.weekday === reminder.weekday && now.toFormat("HH:mm") === reminder.time;
}

async function sendReminder(client, config, event, reminder, now) {
    const channel = await client.channels.fetch(config.channelId);
    if (!channel || !channel.isTextBased()) {
        console.warn(`[Scheduler] Configured channel is not text-based: ${config.channelId}`);
        return;
    }

    const message = formatReminderMessage({ event, reminder, config, now });
    await channel.send({
        content: message,
        allowedMentions: {
            parse: config.mentionEveryone ? ["everyone"] : [],
            roles: config.roleId ? [config.roleId] : [],
        },
    });
}

export async function tickScheduler(client) {
    const config = loadConfig();
    if (!config.enabled) return;
    if (!config.channelId) return;

    const timezone = config.timezone || process.env.BOT_TIMEZONE || "Asia/Bangkok";
    const now = DateTime.now().setZone(timezone);
    const events = loadEvents();

    for (const event of events) {
        if (!event.enabled) continue;

        for (const reminder of event.reminders || []) {
            if (!isReminderDue(now, reminder)) continue;

            const key = reminderKey(now, event.id, reminder);
            if (sentKeys.has(key)) continue;

            sentKeys.add(key);
            await sendReminder(client, { ...config, timezone }, event, reminder, now);
            console.log(`[Scheduler] Sent ${event.id} ${reminder.time}`);
        }
    }
}

export function startScheduler(client) {
    const intervalSeconds = Number(process.env.SCHEDULER_INTERVAL_SECONDS || 30);
    const intervalMs = Math.max(10, intervalSeconds) * 1000;

    console.log(`[Scheduler] Starting loop every ${intervalMs / 1000}s`);
    tickScheduler(client).catch(err => console.error("[Scheduler] Initial tick failed:", err));

    return setInterval(() => {
        tickScheduler(client).catch(err => console.error("[Scheduler] Tick failed:", err));
    }, intervalMs);
}
