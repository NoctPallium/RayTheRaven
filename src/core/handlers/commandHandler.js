const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

module.exports = (client) => {
  client.commands = new Map();

  // ==========================
  // Global Commands
  // ==========================

  const globalCommandsPath = path.join(__dirname, "../../commands");

  console.log("Loading global commands from:", globalCommandsPath);

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

        client.commands.set(command.data.name, command);

        logger.info(`Loaded command: ${command.data.name}`);
      }
    }
  }

  // ==========================
  // Feature Commands
  // ==========================

  const featuresPath = path.join(__dirname, "../../features");

  if (!fs.existsSync(featuresPath)) return;

  const features = fs.readdirSync(featuresPath);

  for (const feature of features) {
    const commandsPath = path.join(featuresPath, feature, "commands");

    if (!fs.existsSync(commandsPath)) continue;

    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));

      client.commands.set(command.data.name, command);

      logger.info(`Loaded feature command: ${command.data.name}`);
    }
  }
};
