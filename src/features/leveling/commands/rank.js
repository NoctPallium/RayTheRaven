const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");

const fs = require("fs");

const { getRank } = require("../services/levelingService");

const { getRequiredXP } = require("../utils/levelFormula");

const generateRankCard = require("../rendering/rankGenerator");

const { db } = require("../../../core/database/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("View your current level.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("View another user's rank.")
        .setRequired(false),
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("user") ?? interaction.user;

    // Get profile
    const profile = await getRank(interaction.guild.id, target.id);

    // Calculate server rank
    const rank = await new Promise((resolve, reject) => {
      db.all(
        `
        SELECT user_id, level, xp
        FROM levels
        WHERE guild_id = ?
        ORDER BY level DESC, xp DESC
        `,
        [interaction.guild.id],
        (err, rows) => {
          if (err) return reject(err);

          const position = rows.findIndex((r) => r.user_id === target.id) + 1;

          resolve(position || rows.length + 1);
        },
      );
    });

    const requiredXP = getRequiredXP(profile.level);

    const imagePath = await generateRankCard(target, profile, rank, requiredXP);

    const attachment = new AttachmentBuilder(imagePath);

    await interaction.reply({
      files: [attachment],
    });

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  },
};
