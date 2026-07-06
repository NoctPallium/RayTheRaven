const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  client.commands = new Map();

  const commandsPath = path.join(__dirname, "../commands");

  console.log("Loading commands from:", commandsPath);

  const commandFolders = fs.readdirSync(commandsPath);

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);

    console.log("Checking folder:", folder);

    const commandFiles = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(path.join(folderPath, file));

      client.commands.set(command.data.name, command);

      console.log(`Loaded command: ${command.data.name}`);
    }
  }
};
