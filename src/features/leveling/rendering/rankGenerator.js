const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const assets = require("../../../core/config/assets");
const layout = require("../layouts/rankLayout");

async function generateRankCard(member, profile, rank, requiredXP) {
  const width = 1920;
  const height = 1080;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // ====================================
  // Background
  // ====================================

  const background = await loadImage(assets.levelBackground);
  ctx.drawImage(background, 0, 0, width, height);

  // ====================================
  // Avatar
  // ====================================

  const avatar = await loadImage(
    member.displayAvatarURL({
      extension: "png",
      size: 512,
    }),
  );

  ctx.save();

  ctx.beginPath();
  ctx.arc(
    layout.avatar.x,
    layout.avatar.y,
    layout.avatar.radius,
    0,
    Math.PI * 2,
  );

  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    avatar,
    layout.avatar.x - layout.avatar.radius,
    layout.avatar.y - layout.avatar.radius,
    layout.avatar.radius * 2,
    layout.avatar.radius * 2,
  );

  ctx.restore();

  // ====================================
  // Username
  // ====================================

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";

  let fontSize = 72;

  do {
    ctx.font = `bold ${fontSize}px Poppins`;
    fontSize--;
  } while (
    ctx.measureText(member.username).width > layout.username.maxWidth &&
    fontSize > 36
  );

  ctx.shadowColor = "#8B5CF6";
  ctx.shadowBlur = 22;

  ctx.fillText(
    member.username,
    layout.username.x,
    layout.username.y,
    layout.username.maxWidth,
  );

  ctx.shadowBlur = 0;

  // ====================================
  // LEVEL TITLE
  // ====================================

  ctx.fillStyle = "#CFAEFF";
  ctx.font = "42px Cinzel";

  ctx.fillText("LEVEL", layout.level.x, layout.level.y - 95);

  // ====================================
  // LEVEL NUMBER
  // ====================================

  ctx.font = "bold 140px Cinzel";

  ctx.shadowColor = "#9B5CFF";
  ctx.shadowBlur = 35;

  ctx.fillStyle = "#F5ECFF";

  ctx.fillText(profile.level.toString(), layout.level.x, layout.level.y + 25);

  ctx.shadowBlur = 0;

  // ====================================
  // XP BAR BACKGROUND
  // ====================================

  const progress = Math.min(profile.xp / requiredXP, 1);

  ctx.beginPath();

  ctx.roundRect(
    layout.xpBar.x,
    layout.xpBar.y,
    layout.xpBar.width,
    layout.xpBar.height,
    layout.xpBar.radius,
  );

  ctx.fillStyle = "#1E1E1E";

  ctx.fill();

  // ====================================
  // XP BAR FILL
  // ====================================

  ctx.beginPath();

  ctx.roundRect(
    layout.xpBar.x,
    layout.xpBar.y,
    layout.xpBar.width * progress,
    layout.xpBar.height,
    layout.xpBar.radius,
  );

  ctx.fillStyle = "#9757FF";

  ctx.shadowColor = "#9757FF";
  ctx.shadowBlur = 25;

  ctx.fill();

  ctx.shadowBlur = 0;

  // ====================================
  // XP TEXT
  // ====================================

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "38px Poppins";

  ctx.fillText(
    `${profile.xp} / ${requiredXP} XP`,
    layout.xpText.x,
    layout.xpText.y,
  );

  // ====================================
  // SERVER RANK TITLE
  // ====================================

  ctx.fillStyle = "#CFAEFF";
  ctx.font = "40px Cinzel";

  ctx.fillText("SERVER RANK", layout.rank.x, layout.rank.y - 95);

  // ====================================
  // SERVER RANK NUMBER
  // ====================================

  ctx.font = "bold 96px Cinzel";

  ctx.fillStyle = "#F5ECFF";

  ctx.shadowColor = "#9757FF";
  ctx.shadowBlur = 30;

  ctx.fillText(`#${rank}`, layout.rank.x, layout.rank.y + 10);

  ctx.shadowBlur = 0;

  // ====================================
  // Save
  // ====================================

  const outputPath = path.join(assets.outputFolder, `rank-${member.id}.png`);

  fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

  return outputPath;
}

module.exports = generateRankCard;
