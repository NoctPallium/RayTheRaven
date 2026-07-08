const { checkYouTubeUpload } = require("../services/youtubeService");

function startYouTubeTask(client) {
  checkYouTubeUpload(client).catch(console.error);

  setInterval(() => {
    checkYouTubeUpload(client).catch(console.error);
  }, 300000);
}

module.exports = {
  startYouTubeTask,
};
