const { EmbedBuilder } = require("discord.js");

const {
  getLevel,
  createLevel,
  updateLevel,
  getLeaderboard,
} = require("../../../core/database/database");

const { getRequiredXP } = require("../utils/levelFormula");

function getRandomLevelUpLine() {
  const lines = [
    "Keep chatting. Keep climbing.",
    "Another step toward the top.",
    "You're climbing the leaderboard.",
    "The ravens approve.",
    "The Perch is watching your progress.",
  ];

  return lines[Math.floor(Math.random() * lines.length)];
}

async function getServerRank(guildId, userId) {
  const leaderboard = await getLeaderboard(guildId, 1000);
  const position = leaderboard.findIndex((row) => row.user_id === userId);

  return position === -1 ? "Unranked" : `#${position + 1}`;
}

// =====================================
// Add XP
// =====================================

async function addXP(message) {
  if (!message.guild) return;
  if (message.author.bot) return;

  await createLevel(message.guild.id, message.author.id);

  const profile = await getLevel(message.guild.id, message.author.id);

  const now = Date.now();

  // 60 second cooldown
  if (now - profile.last_message < 1000) return;

  const gainedXP = Math.floor(Math.random() * 11) + 15;

  let xp = profile.xp + gainedXP;
  let level = profile.level;

  while (xp >= getRequiredXP(level)) {
    xp -= getRequiredXP(level);
    level++;

    const nextRequiredXP = getRequiredXP(level);
    const serverRank = await getServerRank(message.guild.id, message.author.id);

    const embed = new EmbedBuilder()
      .setColor("#7C3AED")
      .setTitle("🎉 Level Up!")
      .setDescription(
        [
          `${message.author} reached **Level ${level}**!`,
          "",
          getRandomLevelUpLine(),
        ].join("\n"),
      )
      .addFields(
        {
          name: "⭐ XP Gained",
          value: `+${gainedXP} XP`,
          inline: true,
        },
        {
          name: "📈 Next Level",
          value: `${xp} / ${nextRequiredXP} XP`,
          inline: true,
        },
        {
          name: "🏆 Server Rank",
          value: serverRank,
          inline: true,
        },
      )
      .setThumbnail(
        message.author.displayAvatarURL({
          extension: "png",
          size: 256,
        }),
      )
      .setFooter({
        text: "Ray Leveling",
      })
      .setTimestamp();

    await message.channel.send({
      embeds: [embed],
    });
  }

  await updateLevel(message.guild.id, message.author.id, xp, level, now);
}

// =====================================
// Get Rank
// =====================================

async function getRank(guildId, userId) {
  await createLevel(guildId, userId);

  return getLevel(guildId, userId);
}

// =====================================
// Get Leaderboard
// =====================================

async function fetchLeaderboard(guildId) {
  return getLeaderboard(guildId);
}

module.exports = {
  addXP,
  getRank,
  fetchLeaderboard,
};
