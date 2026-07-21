const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");

const fs = require("fs");

const { fetchLeaderboard } = require("../services/levelingService");
const generateLeaderboard = require("../rendering/leaderboardGenerator");

const Categories = require("../../../constants/categories");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the server's leveling leaderboard."),

  category: Categories.COMMUNITY,

  description: "Displays the server's leveling leaderboard.",

  usage: "/leaderboard",

  permissions: [],

  cooldown: 10,

  async execute(interaction) {
    await interaction.deferReply();

    const leaderboard = await fetchLeaderboard(interaction.guild.id);

    if (!leaderboard.length) {
      return interaction.editReply({
        content: "Nobody has earned any XP yet.",
      });
    }

    const imagePath = await generateLeaderboard(
      interaction.client,
      leaderboard,
    );

    const attachment = new AttachmentBuilder(imagePath);

    await interaction.editReply({
      files: [attachment],
    });

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  },
};
