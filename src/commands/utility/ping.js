const { SlashCommandBuilder } = require("discord.js");
const Categories = require("../../constants/categories");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Checks if Ray is online."),

  category: Categories.UTILITY,

  description: "Checks if Ray is online and responding.",

  usage: "/ping",

  permissions: [],

  cooldown: 3,

  async execute(interaction) {
    await interaction.reply({
      content: "🏓 Pong!",
    });
  },
};
