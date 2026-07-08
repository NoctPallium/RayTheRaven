const {
  EmbedBuilder,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelType,
} = require("discord.js");

const { updateGuildSetting } = require("../../../core/database/database");

const buildHub = require("./hub");
const getProgress = require("./progress");

// =========================================
// Ticket Button
// =========================================

async function handleButton(interaction) {
  const embed = new EmbedBuilder()
    .setColor("#7C3AED")
    .setTitle("🎫 Ticket Configuration")
    .setDescription(
      "Select the **Category** where ticket channels should be created.",
    );

  const row = new ActionRowBuilder().addComponents(
    new ChannelSelectMenuBuilder()
      .setCustomId("setup_select_ticket_category")
      .setPlaceholder("Select Ticket Category")
      .addChannelTypes(ChannelType.GuildCategory),
  );

  return interaction.update({
    embeds: [embed],
    components: [row],
  });
}

// =========================================
// Channel Select
// =========================================

async function handleChannelSelect(interaction) {
  switch (interaction.customId) {
    case "setup_select_ticket_category": {
      await updateGuildSetting(
        interaction.guild.id,
        "ticket_category_id",
        interaction.values[0],
      );

      const embed = new EmbedBuilder()
        .setColor("#57F287")
        .setTitle("✅ Ticket Category Saved")
        .setDescription(
          "Now select the **Staff Role** that should have access to every ticket.",
        );

      const row = new ActionRowBuilder().addComponents(
        new RoleSelectMenuBuilder()
          .setCustomId("setup_select_staff_role")
          .setPlaceholder("Select Staff Role"),
      );

      return interaction.update({
        embeds: [embed],
        components: [row],
      });
    }
  }
}

// =========================================
// Role Select
// =========================================

async function handleRoleSelect(interaction) {
  switch (interaction.customId) {
    case "setup_select_staff_role": {
      await updateGuildSetting(
        interaction.guild.id,
        "staff_role_id",
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
  handleRoleSelect,
};
