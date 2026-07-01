import {
    ChannelType,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import { loadConfig, updateConfig } from "./config-store.js";
import { findEvent, loadEvents, setEventEnabled } from "./event-store.js";
import { formatEventList, formatReminderMessage } from "./message-format.js";

export function commandData() {
    return [
        new SlashCommandBuilder()
            .setName("ping")
            .setDescription("Check whether the bot is online."),
        new SlashCommandBuilder()
            .setName("setup")
            .setDescription("Configure the alert channel and mention target.")
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
            .addChannelOption(option =>
                option
                    .setName("channel")
                    .setDescription("Channel where reminders will be posted.")
                    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                    .setRequired(true))
            .addRoleOption(option =>
                option
                    .setName("role")
                    .setDescription("Role to tag. Recommended instead of @everyone.")
                    .setRequired(false))
            .addBooleanOption(option =>
                option
                    .setName("mention_everyone")
                    .setDescription("Use @everyone instead of a role. Requires Mention Everyone permission.")
                    .setRequired(false)),
        new SlashCommandBuilder()
            .setName("config")
            .setDescription("Show current bot configuration."),
        new SlashCommandBuilder()
            .setName("events")
            .setDescription("List configured reminders."),
        new SlashCommandBuilder()
            .setName("event-toggle")
            .setDescription("Enable or disable an event.")
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
            .addStringOption(option =>
                option
                    .setName("event")
                    .setDescription("Event ID from /events.")
                    .setRequired(true)
                    .setAutocomplete(true))
            .addBooleanOption(option =>
                option
                    .setName("enabled")
                    .setDescription("Whether this event should send reminders.")
                    .setRequired(true)),
        new SlashCommandBuilder()
            .setName("bot-toggle")
            .setDescription("Enable or disable all scheduled reminders.")
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
            .addBooleanOption(option =>
                option
                    .setName("enabled")
                    .setDescription("Whether the scheduler should send reminders.")
                    .setRequired(true)),
        new SlashCommandBuilder()
            .setName("test-alert")
            .setDescription("Send a test reminder to the configured channel.")
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
            .addStringOption(option =>
                option
                    .setName("event")
                    .setDescription("Event ID from /events.")
                    .setRequired(false)
                    .setAutocomplete(true)),
    ].map(command => command.toJSON());
}

export async function handleAutocomplete(interaction) {
    if (!["event-toggle", "test-alert"].includes(interaction.commandName)) return;

    const focused = interaction.options.getFocused().toLowerCase();
    const choices = loadEvents()
        .filter(event => event.id.includes(focused) || event.name.toLowerCase().includes(focused))
        .slice(0, 25)
        .map(event => ({ name: event.name, value: event.id }));

    await interaction.respond(choices);
}

export async function handleCommand(interaction) {
    if (interaction.commandName === "ping") {
        await interaction.reply({ content: "SAO-DEM alert bot is online.", ephemeral: true });
        return;
    }

    if (interaction.commandName === "setup") {
        const channel = interaction.options.getChannel("channel", true);
        const role = interaction.options.getRole("role", false);
        const mentionEveryone = interaction.options.getBoolean("mention_everyone") ?? false;
        const config = updateConfig({
            channelId: channel.id,
            roleId: mentionEveryone ? "" : (role?.id || ""),
            mentionEveryone,
        });

        await interaction.reply({
            content: [
                "Alert configuration saved.",
                `Channel: <#${config.channelId}>`,
                config.mentionEveryone ? "Mention: @everyone" : `Mention: ${config.roleId ? `<@&${config.roleId}>` : "none"}`,
            ].join("\n"),
            ephemeral: true,
        });
        return;
    }

    if (interaction.commandName === "config") {
        const config = loadConfig();
        await interaction.reply({
            content: [
                `Enabled: ${config.enabled ? "ON" : "OFF"}`,
                `Channel: ${config.channelId ? `<#${config.channelId}>` : "not set"}`,
                `Mention: ${config.mentionEveryone ? "@everyone" : (config.roleId ? `<@&${config.roleId}>` : "none")}`,
                `Timezone: ${config.timezone}`,
            ].join("\n"),
            ephemeral: true,
        });
        return;
    }

    if (interaction.commandName === "events") {
        const config = loadConfig();
        await interaction.reply({
            content: formatEventList(loadEvents(), config.timezone),
            ephemeral: true,
        });
        return;
    }

    if (interaction.commandName === "event-toggle") {
        const eventId = interaction.options.getString("event", true);
        const enabled = interaction.options.getBoolean("enabled", true);
        const event = setEventEnabled(eventId, enabled);

        await interaction.reply({
            content: event
                ? `${event.name} is now ${enabled ? "ON" : "OFF"}.`
                : `Unknown event ID: ${eventId}`,
            ephemeral: true,
        });
        return;
    }

    if (interaction.commandName === "bot-toggle") {
        const enabled = interaction.options.getBoolean("enabled", true);
        updateConfig({ enabled });
        await interaction.reply({
            content: `Scheduler is now ${enabled ? "ON" : "OFF"}.`,
            ephemeral: true,
        });
        return;
    }

    if (interaction.commandName === "test-alert") {
        const config = loadConfig();
        const events = loadEvents();
        const eventId = interaction.options.getString("event", false) || events[0]?.id;
        const event = findEvent(events, eventId);

        if (!event) {
            await interaction.reply({ content: `Unknown event ID: ${eventId}`, ephemeral: true });
            return;
        }

        if (!config.channelId) {
            await interaction.reply({ content: "Run /setup first so I know which channel to post in.", ephemeral: true });
            return;
        }

        const channel = await interaction.client.channels.fetch(config.channelId);
        const reminder = event.reminders[0];
        await channel.send(formatReminderMessage({ event, reminder, config }));
        await interaction.reply({ content: `Test alert sent to <#${config.channelId}>.`, ephemeral: true });
    }
}
