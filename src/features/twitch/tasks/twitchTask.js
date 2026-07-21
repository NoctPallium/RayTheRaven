const { checkTwitchLive } = require("../services/twitchService");
const healthStatus = require("../../../core/utils/healthStatus");

const CHECK_INTERVAL = 120000;

function hasTwitchConfiguration() {
  return Boolean(
    process.env.TWITCH_CLIENT_ID &&
    process.env.TWITCH_CLIENT_SECRET &&
    process.env.TWITCH_CHANNEL &&
    process.env.TWITCH_NOTIFY_CHANNEL_ID,
  );
}

async function runTwitchCheck(client) {
  try {
    await checkTwitchLive(client);

    healthStatus.updateService(
      "twitch",
      "online",
      "Twitch monitoring is running.",
    );
  } catch (error) {
    healthStatus.updateService(
      "twitch",
      "degraded",
      error.message || "The Twitch check failed.",
    );

    console.error("❌ Twitch monitoring error:", error);
  }
}

function startTwitchTask(client) {
  if (!hasTwitchConfiguration()) {
    healthStatus.updateService(
      "twitch",
      "disabled",
      "Twitch monitoring is not fully configured.",
    );

    return null;
  }

  healthStatus.updateService(
    "twitch",
    "starting",
    "Starting Twitch monitoring...",
  );

  void runTwitchCheck(client);

  return setInterval(() => {
    void runTwitchCheck(client);
  }, CHECK_INTERVAL);
}

module.exports = {
  startTwitchTask,
};
