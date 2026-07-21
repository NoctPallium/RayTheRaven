const { checkYouTubeUpload } = require("../services/youtubeService");
const healthStatus = require("../../../core/utils/healthStatus");

const CHECK_INTERVAL = 300000;

function hasYouTubeConfiguration() {
  return Boolean(
    process.env.YOUTUBE_CHANNEL_ID && process.env.YOUTUBE_NOTIFY_CHANNEL_ID,
  );
}

async function runYouTubeCheck(client) {
  try {
    await checkYouTubeUpload(client);

    healthStatus.updateService(
      "youtube",
      "online",
      "YouTube monitoring is running.",
    );
  } catch (error) {
    healthStatus.updateService(
      "youtube",
      "degraded",
      error.message || "The YouTube check failed.",
    );

    console.error("❌ YouTube monitoring error:", error);
  }
}

function startYouTubeTask(client) {
  if (!hasYouTubeConfiguration()) {
    healthStatus.updateService(
      "youtube",
      "disabled",
      "YouTube monitoring is not fully configured.",
    );

    return null;
  }

  healthStatus.updateService(
    "youtube",
    "starting",
    "Starting YouTube monitoring...",
  );

  void runYouTubeCheck(client);

  return setInterval(() => {
    void runYouTubeCheck(client);
  }, CHECK_INTERVAL);
}

module.exports = {
  startYouTubeTask,
};
