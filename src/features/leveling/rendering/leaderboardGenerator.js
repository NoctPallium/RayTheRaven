const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const assets = require("../../../core/config/assets");
const layout = require("../layouts/leaderboardLayout");
const { getRequiredXP } = require("../utils/levelFormula");

async function generateLeaderboard(client, leaderboard) {
  const width = 1920;
  const height = 1080;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // =====================================
  // Background
  // =====================================

  const background = await loadImage(assets.leaderboardBackground);

  ctx.drawImage(background, 0, 0, width, height);

  // =====================================
  // Leaderboard Rows
  // =====================================

  let currentY = layout.rows.startY;

  for (let i = 0; i < leaderboard.length && i < 10; i++) {
    const user = leaderboard[i];

    let discordUser;

    try {
      discordUser = await client.users.fetch(user.user_id);
    } catch (error) {
      console.error(`Failed to fetch leaderboard user ${user.user_id}:`, error);

      currentY += layout.rows.gap;
      continue;
    }

    // =====================================
    // XP Bar
    // =====================================

    const requiredXP = getRequiredXP(user.level);
    const progress =
      requiredXP > 0 ? Math.min(Math.max(user.xp / requiredXP, 0), 1) : 0;

    const xpBarY = currentY + layout.left.xpBarOffsetY;

    // Empty bar
    ctx.beginPath();
    ctx.roundRect(
      layout.left.xpBarX,
      xpBarY,
      layout.left.xpBarWidth,
      layout.left.xpBarHeight,
      layout.left.xpBarRadius,
    );

    ctx.fillStyle = "#1E1E1E";
    ctx.fill();

    // Filled portion
    if (progress > 0) {
      const progressWidth = Math.max(
        layout.left.xpBarHeight,
        layout.left.xpBarWidth * progress,
      );

      ctx.beginPath();
      ctx.roundRect(
        layout.left.xpBarX,
        xpBarY,
        progressWidth,
        layout.left.xpBarHeight,
        layout.left.xpBarRadius,
      );

      ctx.fillStyle = "#9757FF";
      ctx.shadowColor = "#9757FF";
      ctx.shadowBlur = 12;
      ctx.fill();

      ctx.shadowBlur = 0;
    }

    // =====================================
    // Avatar
    // =====================================

    const avatar = await loadImage(
      discordUser.displayAvatarURL({
        extension: "png",
        size: 128,
      }),
    );

    ctx.save();

    ctx.beginPath();
    ctx.arc(
      layout.right.avatarX,
      currentY,
      layout.avatar.radius,
      0,
      Math.PI * 2,
    );

    ctx.closePath();
    ctx.clip();

    ctx.drawImage(
      avatar,
      layout.right.avatarX - layout.avatar.radius,
      currentY - layout.avatar.radius,
      layout.avatar.radius * 2,
      layout.avatar.radius * 2,
    );

    ctx.restore();

    // =====================================
    // Avatar Ring
    // =====================================

    ctx.beginPath();
    ctx.arc(
      layout.right.avatarX,
      currentY,
      layout.avatar.radius + 4,
      0,
      Math.PI * 2,
    );

    ctx.strokeStyle = "#9757FF";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#9757FF";
    ctx.shadowBlur = 12;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // =====================================
    // Username
    // =====================================

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";

    let usernameFontSize = 42;

    do {
      ctx.font = `bold ${usernameFontSize}px Poppins`;
      usernameFontSize--;
    } while (
      ctx.measureText(discordUser.username).width > layout.username.maxWidth &&
      usernameFontSize > 24
    );

    ctx.shadowColor = "#8B5CF6";
    ctx.shadowBlur = 14;

    ctx.fillText(discordUser.username, layout.right.usernameX, currentY - 8);

    ctx.shadowBlur = 0;

    // =====================================
    // Level
    // =====================================

    ctx.textAlign = "center";
    ctx.fillStyle = "#CFAEFF";
    ctx.font = "bold 34px Poppins";

    ctx.fillText(`LVL ${user.level}`, layout.right.levelX, currentY - 10);

    // =====================================
    // XP
    // =====================================

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "24px Poppins";

    ctx.fillText(`${user.xp} XP`, layout.right.xpX, currentY - 10);

    currentY += layout.rows.gap;
  }

  // =====================================
  // Save
  // =====================================

  const outputPath = path.join(assets.outputFolder, "leaderboard.png");

  fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

  return outputPath;
}

module.exports = generateLeaderboard;
