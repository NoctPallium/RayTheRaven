const roleConfig = require("../../reactionRoles/config/roleConfig");

const MENU_CONFIG = {
  community_games: roleConfig.games,
  community_interests: roleConfig.interests,
};

function getRoleMap(guild, entries) {
  const map = new Map();

  for (const entry of entries) {
    const role = guild.roles.cache.find((candidate) => candidate.name === entry.label);
    if (role) map.set(role.id, role);
  }

  return map;
}

module.exports = async function communityRoleMenus(interaction) {
  if (!interaction.inGuild()) {
    return interaction.reply({
      content: "❌ Community roles can only be changed inside a server.",
      ephemeral: true,
    });
  }

  const entries = MENU_CONFIG[interaction.customId];
  if (!entries) return;

  const availableRoles = getRoleMap(interaction.guild, entries);
  const selectedRoleIds = interaction.values.filter((roleId) => availableRoles.has(roleId));
  const categoryRoleIds = [...availableRoles.keys()];

  const rolesToAdd = selectedRoleIds.filter(
    (roleId) => !interaction.member.roles.cache.has(roleId),
  );

  const rolesToRemove = categoryRoleIds.filter(
    (roleId) =>
      interaction.member.roles.cache.has(roleId) &&
      !selectedRoleIds.includes(roleId),
  );

  if (rolesToAdd.length > 0) {
    await interaction.member.roles.add(
      rolesToAdd,
      `Community Hub selection by ${interaction.user.tag}`,
    );
  }

  if (rolesToRemove.length > 0) {
    await interaction.member.roles.remove(
      rolesToRemove,
      `Community Hub selection by ${interaction.user.tag}`,
    );
  }

  const addedNames = rolesToAdd
    .map((roleId) => availableRoles.get(roleId)?.name)
    .filter(Boolean);

  const removedNames = rolesToRemove
    .map((roleId) => availableRoles.get(roleId)?.name)
    .filter(Boolean);

  const response = [];

  if (addedNames.length > 0) response.push(`✅ Added: **${addedNames.join(", ")}**`);
  if (removedNames.length > 0) response.push(`🗑️ Removed: **${removedNames.join(", ")}**`);
  if (response.length === 0) response.push("✅ Your roles are already up to date.");

  return interaction.reply({
    content: response.join("\n"),
    ephemeral: true,
  });
};
