const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const assets = require("../../../core/config/assets");
const layout = require("../layouts/welcomeLayout");

async function generateWelcomeImage(member) {
  const width = 1920;
  const height = 1080;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // =========================================
  // Background
  // =========================================

  const background = await loadImage(assets.welcomeBanner);

  ctx.drawImage(background, 0, 0, width, height);

  // =========================================
  // Avatar
  // =========================================

  const avatar = await loadImage(
    member.user.displayAvatarURL({
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

  // =========================================
  // Username
  // =========================================

  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  let fontSize = 64;

  do {
    ctx.font = `bold ${fontSize}px Poppins`;
    fontSize--;
  } while (ctx.measureText(member.user.username).width > 620 && fontSize > 34);

  ctx.fillText(member.user.username, layout.username.x, layout.username.y);

  // =========================================
  // Member Count
  // =========================================

  ctx.fillStyle = "#B27CFF";
  ctx.font = "42px Poppins";

  ctx.fillText(
    `Member #${member.guild.memberCount}`,
    layout.memberCount.x,
    layout.memberCount.y,
  );

  // =========================================
  // Save
  // =========================================

  const outputPath = path.join(assets.outputFolder, "welcome.png");

  fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

  return outputPath;
}

module.exports = generateWelcomeImage;
