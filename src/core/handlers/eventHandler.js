const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

module.exports = (client) => {
  // ==========================
  // Global Events
  // ==========================

  const globalEventsPath = path.join(__dirname, "../../events");

  console.log("Loading global events from:", globalEventsPath);

  if (fs.existsSync(globalEventsPath)) {
    const folders = fs.readdirSync(globalEventsPath);

    for (const folder of folders) {
      const folderPath = path.join(globalEventsPath, folder);

      if (!fs.statSync(folderPath).isDirectory()) continue;

      const eventFiles = fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith(".js"));

      for (const file of eventFiles) {
        const event = require(path.join(folderPath, file));

        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args));
        } else {
          client.on(event.name, (...args) => event.execute(...args));
        }

        logger.info(`Loaded event: ${event.name}`);
      }
    }
  }

  // ==========================
  // Feature Events
  // ==========================

  const featuresPath = path.join(__dirname, "../../features");

  if (!fs.existsSync(featuresPath)) return;

  const features = fs.readdirSync(featuresPath);

  for (const feature of features) {
    const eventsPath = path.join(featuresPath, feature, "events");

    if (!fs.existsSync(eventsPath)) continue;

    const eventFiles = fs
      .readdirSync(eventsPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of eventFiles) {
      const event = require(path.join(eventsPath, file));

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }

      logger.info(`Loaded feature event: ${event.name}`);
    }
  }
};
