require("dotenv").config();
require("./core/database/database");
require("./core/utils/fonts");

const { Client, GatewayIntentBits, Collection } = require("discord.js");

const commandHandler = require("./core/handlers/commandHandler");
const eventHandler = require("./core/handlers/eventHandler");
const logger = require("./core/utils/logger");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// Load handlers
commandHandler(client);
eventHandler(client);

// Ready event
client.once("ready", () => {
  logger.info(`🟢 Logged in as ${client.user.tag}`);
});

// Login
client.login(process.env.DISCORD_TOKEN);
