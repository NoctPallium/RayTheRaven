require("dotenv").config();

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const commandHandler = require("./handlers/commandHandler");
const eventHandler = require("./handlers/eventHandler");
const logger = require("./utils/logger");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

commandHandler(client);
eventHandler(client);

client.once("ready", () => {
  logger.info(`Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
