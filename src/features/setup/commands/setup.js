const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Configure Ray for this server."),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("#7C3AED")
      .setTitle("🐦‍⬛ Ray Configuration")
      .setDescription(
        [
          "Welcome to **Ray's Configuration Hub**.",
          "",
          "Choose what you'd like to configure.",
          "",
          "👋 **Welcome**",
          "Configure welcome & log channels.",
          "",
          "🎫 **Tickets**",
          "Configure ticket category & staff role.",
          "",
          "🛡️ **Roles**",
          "Configure the automatic member role.",
        ].join("\n"),
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("setup_welcome")
        .setLabel("Welcome")
        .setEmoji("👋")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("setup_tickets")
        .setLabel("Tickets")
        .setEmoji("🎫")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("setup_roles")
        .setLabel("Roles")
        .setEmoji("🛡️")
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
};
