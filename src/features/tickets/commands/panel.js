const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Create one of Ray's panels.")
    .addSubcommand((sub) =>
      sub.setName("tickets").setDescription("Create the ticket panel."),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (interaction.options.getSubcommand() !== "tickets") return;

    const embed = new EmbedBuilder()
      .setColor("#7C3AED")
      .setTitle("🎫 Open a Ticket")
      .setDescription(
        [
          "Need help?",
          "",
          "Select a ticket type from the menu below.",
          "",
          "🔴 Report",
          "🛠️ Support",
          "❓ Question",
        ].join("\n"),
      );

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_create")
        .setPlaceholder("Choose a ticket type...")
        .addOptions(
          {
            label: "Report",
            description: "Report a member or issue",
            value: "report",
            emoji: "🔴",
          },
          {
            label: "Support",
            description: "Get help from staff",
            value: "support",
            emoji: "🛠️",
          },
          {
            label: "Question",
            description: "Ask a question",
            value: "question",
            emoji: "❓",
          },
        ),
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
