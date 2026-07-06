require("dotenv").config();

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const commandHandler = require("./handlers/commandHandler");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

commandHandler(client);

client.once("ready", () => {
  console.log(`🟢 Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
