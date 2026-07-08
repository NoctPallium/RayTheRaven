const { checkTwitchLive } = require("../services/twitchService");

function startTwitchTask(client) {
  // Check once when Ray starts
  checkTwitchLive(client).catch(console.error);

  // Check every 2 minutes
  setInterval(() => {
    checkTwitchLive(client).catch(console.error);
  }, 120000);
}

module.exports = {
  startTwitchTask,
};
