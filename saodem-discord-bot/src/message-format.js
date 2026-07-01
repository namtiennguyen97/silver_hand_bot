import { DateTime } from "luxon";

export function mentionText(config) {
    if (config.mentionEveryone) return "@everyone";
    if (config.roleId) return `<@&${config.roleId}>`;
    return "";
}

export function formatReminderMessage({ event, reminder, config, now = DateTime.now().setZone(config.timezone) }) {
    const mention = mentionText(config);
    const lines = [
        mention,
        `## ${event.name}`,
        `**Time:** ${reminder.label}`,
        `**Now:** ${now.toFormat("ccc HH:mm")} (${config.timezone})`,
        reminder.message,
    ].filter(Boolean);

    if (event.notes) lines.push(`_${event.notes}_`);
    return lines.join("\n");
}

export function formatEventList(events, timezone) {
    return events.map(event => {
        const state = event.enabled ? "ON" : "OFF";
        const reminders = event.reminders
            .map(reminder => `- ${reminder.label}: ${reminder.message}`)
            .join("\n");
        return `### ${event.name} [${state}]\nID: \`${event.id}\`\n${reminders}`;
    }).join("\n\n") || `No events configured. Timezone: ${timezone}`;
}
