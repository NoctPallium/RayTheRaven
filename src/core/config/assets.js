const path = require("path");

module.exports = {
  rayLogo: path.join(__dirname, "../../../assets/images/ray-logo.png"),

  welcomeBanner: path.join(
    __dirname,
    "../../../assets/backgrounds/welcome-banner.png",
  ),

  levelBackground: path.join(
    __dirname,
    "../../../assets/backgrounds/level-background.png",
  ),

  leaderboardBackground: path.join(
    __dirname,
    "../../../assets/backgrounds/leaderboard-background.png",
  ),

  outputFolder: path.join(__dirname, "../../../assets/output"),
};
