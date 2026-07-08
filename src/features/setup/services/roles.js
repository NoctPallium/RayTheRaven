const {
  EmbedBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
} = require("discord.js");

const { updateGuildSetting } = require("../../../core/database/database");

const buildHub = require("./hub");
const getProgress = require("./progress");

// =========================================
// Roles Button
// =========================================

async function handleButton(interaction) {
  const embed = new EmbedBuilder()
    .setColor("#7C3AED")
    .setTitle("🛡️ Role Configuration")
    .setDescription(
      "Select the role new members should automatically receive when they join.",
    );

  const row = new ActionRowBuilder().addComponents(
    new RoleSelectMenuBuilder()
      .setCustomId("setup_select_auto_role")
      .setPlaceholder("Select Auto Role"),
  );

  return interaction.update({
    embeds: [embed],
    components: [row],
  });
}

// =========================================
// Role Select
// =========================================

async function handleRoleSelect(interaction) {
  switch (interaction.customId) {
    case "setup_select_auto_role": {
      await updateGuildSetting(
        interaction.guild.id,
        "auto_role_id",
        interaction.values[0],
      );

      const progress = await getProgress(interaction.guild.id);

      return interaction.update(buildHub(progress));
    }
  }
}

module.exports = {
  handleButton,
  handleRoleSelect,
};
