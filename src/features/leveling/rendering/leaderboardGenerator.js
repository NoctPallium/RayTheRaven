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

  const background = await loadImage(assets.leaderboardBackground);
  ctx.drawImage(background, 0, 0, width, height);

  let currentY = layout.rows.startY;

  for (let i = 0; i < leaderboard.length; i++) {
    const user = leaderboard[i];

    let discordUser;

    try {
      discordUser = await client.users.fetch(user.user_id);
    } catch {
      currentY += layout.rows.gap;
      continue;
    }
    // ==========================
    // Left XP Bar
    // ==========================

    const requiredXP = getRequiredXP(user.level);
    const progress = Math.min(user.xp / requiredXP, 1);

    const xpBarY = currentY + layout.left.xpBarOffsetY;

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

    ctx.beginPath();
    ctx.roundRect(
      layout.left.xpBarX,
      xpBarY,
      layout.left.xpBarWidth * progress,
      layout.left.xpBarHeight,
      layout.left.xpBarRadius,
    );
    ctx.fillStyle = "#9757FF";
    ctx.shadowColor = "#9757FF";
    ctx.shadowBlur = 12;
    ctx.fill();

    ctx.shadowBlur = 0;

    // ==========================
    // Avatar on Right Panel
    // ==========================

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

    // Avatar ring
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

    // ==========================
    // Username on Right Panel
    // ==========================

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";

    let username = discordUser.username;
    let usernameFontSize = 42;

    do {
      ctx.font = `bold ${usernameFontSize}px Poppins`;
      usernameFontSize--;
    } while (
      ctx.measureText(username).width > layout.username.maxWidth &&
      usernameFontSize > 24
    );

    ctx.shadowColor = "#8B5CF6";
    ctx.shadowBlur = 14;

    ctx.fillText(username, layout.right.usernameX, currentY - 8);

    ctx.shadowBlur = 0;

    // ==========================
    // Level
    // ==========================

    ctx.textAlign = "center";
    ctx.fillStyle = "#CFAEFF";
    ctx.font = "bold 34px Poppins";

    ctx.fillText(`LVL ${user.level}`, layout.right.levelX, currentY - 10);

    // ==========================
    // XP
    // ==========================

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "24px Poppins";

    ctx.fillText(`${user.xp} XP`, layout.right.xpX, currentY - 10);

    currentY += layout.rows.gap;
  }

  const output = path.join(assets.outputFolder, "leaderboard.png");

  fs.writeFileSync(output, canvas.toBuffer("image/png"));

  return output;
}

module.exports = generateLeaderboard;
