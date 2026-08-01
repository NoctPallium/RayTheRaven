const { PermissionFlagsBits } = require("discord.js");

const MEMBER_ROLE_ID = "1516639546220085248";

module.exports = {
  name: "guildMemberAdd",
  once: false,

  async execute(member) {
    console.log(`🔔 Auto-role event triggered for ${member.user.tag}`);

    try {
      const role = await member.guild.roles.fetch(MEMBER_ROLE_ID);

      if (!role) {
        console.error(`❌ Role not found. Checked ID: ${MEMBER_ROLE_ID}`);
        return;
      }

      const ray = member.guild.members.me;

      if (!ray) {
        console.error("❌ Ray could not be found in the server.");
        return;
      }

      if (!ray.permissions.has(PermissionFlagsBits.ManageRoles)) {
        console.error("❌ Ray does not have Manage Roles permission.");
        return;
      }

      if (ray.roles.highest.position <= role.position) {
        console.error(
          `❌ Ray's highest role must be above the "${role.name}" role.`,
        );
        return;
      }

      if (member.roles.cache.has(role.id)) {
        console.log(`ℹ️ ${member.user.tag} already has the ${role.name} role.`);
        return;
      }

      await member.roles.add(
        role,
        "Automatically assigned when joining The Perch",
      );

      console.log(`✅ Successfully gave ${role.name} to ${member.user.tag}`);
    } catch (error) {
      console.error("❌ Auto-role failed:", error);
    }
  },
};
