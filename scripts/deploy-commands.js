require("dotenv").config();

const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];
const names = new Set();

function addCommand(filePath, label) {
  const command = require(filePath);

  if (!command?.data?.name || typeof command.execute !== "function") {
    throw new Error(`Invalid command file: ${filePath}`);
  }

  if (names.has(command.data.name)) {
    throw new Error(`Duplicate command name detected: ${command.data.name}`);
  }

  names.add(command.data.name);
  commands.push(command.data.toJSON());
  console.log(`Loaded ${label} command: ${command.data.name}`);
}

const globalCommandsPath = path.join(__dirname, "../src/commands");
if (fs.existsSync(globalCommandsPath)) {
  for (const folder of fs.readdirSync(globalCommandsPath)) {
    const folderPath = path.join(globalCommandsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    for (const file of fs.readdirSync(folderPath).filter((name) => name.endsWith(".js"))) {
      addCommand(path.join(folderPath, file), "global");
    }
  }
}

const featuresPath = path.join(__dirname, "../src/features");
if (fs.existsSync(featuresPath)) {
  for (const feature of fs.readdirSync(featuresPath)) {
    const commandsPath = path.join(featuresPath, feature, "commands");
    if (!fs.existsSync(commandsPath)) continue;

    for (const file of fs.readdirSync(commandsPath).filter((name) => name.endsWith(".js"))) {
      addCommand(path.join(commandsPath, file), "feature");
    }
  }
}

for (const key of ["DISCORD_TOKEN", "CLIENT_ID", "GUILD_ID"]) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`\n🚀 Registering ${commands.length} command(s)...`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log("✅ Commands registered successfully!");
  } catch (error) {
    console.error("❌ Command deployment failed:", error);
    process.exitCode = 1;
  }
})();
