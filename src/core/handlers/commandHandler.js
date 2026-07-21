const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

function loadCommand(client, filePath, label) {
  const command = require(filePath);

  if (!command?.data?.name || typeof command.execute !== "function") {
    logger.warn(`Skipped invalid command file: ${filePath}`);
    return;
  }

  if (client.commands.has(command.data.name)) {
    throw new Error(`Duplicate command name detected: ${command.data.name}`);
  }

  client.commands.set(command.data.name, command);
  logger.info(`Loaded ${label} command: ${command.data.name}`);
}

module.exports = (client) => {
  client.commands.clear();

  const globalCommandsPath = path.join(__dirname, "../../commands");

  if (fs.existsSync(globalCommandsPath)) {
    const folders = fs.readdirSync(globalCommandsPath);

    for (const folder of folders) {
      const folderPath = path.join(globalCommandsPath, folder);
      if (!fs.statSync(folderPath).isDirectory()) continue;

      const commandFiles = fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        loadCommand(client, path.join(folderPath, file), "global");
      }
    }
  }

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
      loadCommand(client, path.join(commandsPath, file), "feature");
    }
  }
};
