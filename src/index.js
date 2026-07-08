require("dotenv").config();
require("./core/database/database");
require("./core/utils/fonts");

const { Client, GatewayIntentBits, Collection } = require("discord.js");

const commandHandler = require("./core/handlers/commandHandler");
const eventHandler = require("./core/handlers/eventHandler");
const logger = require("./core/utils/logger");

const { startTwitchTask } = require("./features/twitch/tasks/twitchTask");
const { startYouTubeTask } = require("./features/youtube/tasks/youtubeTask");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

commandHandler(client);
eventHandler(client);

client.once("clientReady", () => {
  logger.info(`🟢 Logged in as ${client.user.tag}`);

  startTwitchTask(client);
  logger.info("🟣 Twitch monitoring started.");

  startYouTubeTask(client);
  logger.info("🔴 YouTube monitoring started.");
});

client.login(process.env.DISCORD_TOKEN);
