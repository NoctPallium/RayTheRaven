const config = require("../config/roleConfig");

const roleMap = {
  role_twitch: config.twitch.roleId,
  role_youtube: config.youtube.roleId,
  role_updates: config.updates.roleId,
  role_events: config.events.roleId,
  role_revive: config.revive.roleId,
  role_bump: config.bump.roleId,
};

module.exports = async (interaction) => {
  if (!interaction.isButton()) return;

  const roleId = roleMap[interaction.customId];

  if (!roleId) return;

  const role = interaction.guild.roles.cache.get(roleId);

  if (!role) {
    return interaction.reply({
      content: "❌ That role no longer exists.",
      ephemeral: true,
    });
  }

  const member = interaction.member;

  if (member.roles.cache.has(roleId)) {
    await member.roles.remove(role);

    return interaction.reply({
      content: `🗑️ Removed **${role.name}**.`,
      ephemeral: true,
    });
  }

  await member.roles.add(role);

  return interaction.reply({
    content: `✅ Added **${role.name}**.`,
    ephemeral: true,
  });
};
