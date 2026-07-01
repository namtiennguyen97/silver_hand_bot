import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { handleAutocomplete, handleCommand } from "./commands.js";
import { startScheduler } from "./scheduler.js";

const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error("Missing DISCORD_TOKEN in .env");
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);
    startScheduler(readyClient);
});

client.on(Events.InteractionCreate, async interaction => {
    try {
        if (interaction.isAutocomplete()) {
            await handleAutocomplete(interaction);
            return;
        }

        if (interaction.isChatInputCommand()) {
            await handleCommand(interaction);
        }
    } catch (err) {
        console.error("[Interaction] Error:", err);
        const content = "Command failed. Check the bot console logs.";
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp({ content, ephemeral: true }).catch(() => {});
        } else {
            await interaction.reply({ content, ephemeral: true }).catch(() => {});
        }
    }
});

client.login(token);
