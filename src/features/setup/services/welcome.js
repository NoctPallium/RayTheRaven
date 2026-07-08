const {
  EmbedBuilder,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
} = require("discord.js");

const { updateGuildSetting } = require("../../../core/database/database");

const buildHub = require("./hub");
const getProgress = require("./progress");

// =========================================
// Welcome Button
// =========================================

async function handleButton(interaction) {
  const embed = new EmbedBuilder()
    .setColor("#7C3AED")
    .setTitle("👋 Welcome Configuration")
    .setDescription(
      "Select the **Welcome Channel** where Ray should send welcome cards.",
    );

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

// =========================================
// Channel Select Menus
// =========================================

async function handleChannelSelect(interaction) {
  switch (interaction.customId) {
    // ===============================
    // Welcome Channel
    // ===============================

    case "setup_select_welcome": {
      await updateGuildSetting(
        interaction.guild.id,
        "welcome_channel_id",
        interaction.values[0],
      );

      const embed = new EmbedBuilder()
        .setColor("#57F287")
        .setTitle("✅ Welcome Channel Saved")
        .setDescription(
          "Now select the **Log Channel** where Ray should send moderation logs.",
        );

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

    // ===============================
    // Log Channel
    // ===============================

    case "setup_select_logs": {
      await updateGuildSetting(
        interaction.guild.id,
        "log_channel_id",
        interaction.values[0],
      );

      const progress = await getProgress(interaction.guild.id);

      return interaction.update(buildHub(progress));
    }
  }
}

module.exports = {
  handleButton,
  handleChannelSelect,
};
