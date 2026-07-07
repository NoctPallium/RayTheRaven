const {
  EmbedBuilder,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
} = require("discord.js");

const { updateGuildSetting } = require("../../../core/database/database");

async function handleButton(interaction) {
  switch (interaction.customId) {
    case "setup_welcome": {
      const embed = new EmbedBuilder()
        .setColor("#7C3AED")
        .setTitle("👋 Welcome Configuration")
        .setDescription("Select the **Welcome Channel** for Ray.");

      const row = new ActionRowBuilder().addComponents(
        new ChannelSelectMenuBuilder()
          .setCustomId("setup_select_welcome")
          .setPlaceholder("Select Welcome Channel")
          .addChannelTypes(ChannelType.GuildText),
      );

      return interaction.update({
        embeds: [embed],
        components: [row],
      });
    }
  }
}

async function handleChannelSelect(interaction) {
  switch (interaction.customId) {
    // =====================================
    // Welcome Channel
    // =====================================

    case "setup_select_welcome": {
      const channelId = interaction.values[0];

      await updateGuildSetting(
        interaction.guild.id,
        "welcome_channel_id",
        channelId,
      );

      const embed = new EmbedBuilder()
        .setColor("#57F287")
        .setTitle("👋 Welcome Channel Saved")
        .setDescription("Now select the **Log Channel**.");

      const row = new ActionRowBuilder().addComponents(
        new ChannelSelectMenuBuilder()
          .setCustomId("setup_select_logs")
          .setPlaceholder("Select Log Channel")
          .addChannelTypes(ChannelType.GuildText),
      );

      return interaction.update({
        embeds: [embed],
        components: [row],
      });
    }

    // =====================================
    // Log Channel
    // =====================================

    case "setup_select_logs": {
      const channelId = interaction.values[0];

      await updateGuildSetting(
        interaction.guild.id,
        "log_channel_id",
        channelId,
      );

      const embed = new EmbedBuilder()
        .setColor("#57F287")
        .setTitle("✅ Welcome Setup Complete")
        .setDescription(
          [
            "Your welcome settings have been saved.",
            "",
            "Next we'll configure **Tickets**.",
          ].join("\n"),
        );

      return interaction.update({
        embeds: [embed],
        components: [],
      });
    }
  }
}

async function handleRoleSelect(interaction) {
  // We'll build this next.
}

module.exports = {
  handleButton,
  handleChannelSelect,
  handleRoleSelect,
};
