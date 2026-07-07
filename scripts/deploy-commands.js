require("dotenv").config();

const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];

// ==========================================
// Global Commands
// ==========================================

const globalCommandsPath = path.join(__dirname, "../src/commands");

if (fs.existsSync(globalCommandsPath)) {
  const folders = fs.readdirSync(globalCommandsPath);

  for (const folder of folders) {
    const folderPath = path.join(globalCommandsPath, folder);

    if (!fs.statSync(folderPath).isDirectory()) continue;

    const commandFiles = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(path.join(folderPath, file));
      commands.push(command.data.toJSON());

      console.log(`Loaded global command: ${command.data.name}`);
    }
  }
}

// ==========================================
// Feature Commands
// ==========================================

const featuresPath = path.join(__dirname, "../src/features");

if (fs.existsSync(featuresPath)) {
  const features = fs.readdirSync(featuresPath);

  for (const feature of features) {
    const commandsPath = path.join(featuresPath, feature, "commands");

    if (!fs.existsSync(commandsPath)) continue;

    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));
      commands.push(command.data.toJSON());

      console.log(`Loaded feature command: ${command.data.name}`);
    }
  }
}

// ==========================================
// Register Commands
// ==========================================

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`\n🚀 Registering ${commands.length} command(s)...`);

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID,
      ),
      {
        body: commands,
      },
    );

    console.log("✅ Commands registered successfully!");
  } catch (error) {
    console.error(error);
  }
})();
