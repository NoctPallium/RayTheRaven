const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const Categories = require("../../../constants/categories");
const roleConfig = require("../../reactionRoles/config/roleConfig");

async function ensureCommunityRoles(guild, entries) {
  const roles = [];

  for (const entry of entries) {
    let role = guild.roles.cache.find((candidate) => candidate.name === entry.label);

    if (!role) {
      role = await guild.roles.create({
        name: entry.label,
        hoist: false,
        mentionable: false,
        reason: "Created automatically for Ray's Community Hub.",
      });
    }

    roles.push({ ...entry, roleId: role.id });
  }

  return roles;
}

function buildRoleMenu(customId, placeholder, roles) {
  return new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .setMinValues(0)
    .setMaxValues(roles.length)
    .addOptions(
      roles.map((role) => ({
        label: role.label,
        value: role.roleId,
        emoji: role.emoji,
        description: `Toggle the ${role.label} role`,
      })),
    );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("communityhub")
    .setDescription("Post Ray's community role hub.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  category: Categories.COMMUNITY,
  description:
    "Posts a polished community hub for game, interest, and notification roles.",
  usage: "/communityhub",
  permissions: ["Administrator"],
  cooldown: 10,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const me = interaction.guild.members.me;

    if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.editReply(
        "❌ Ray needs the **Manage Roles** permission before the Community Hub can be created.",
      );
    }

    const gameRoles = await ensureCommunityRoles(interaction.guild, roleConfig.games);
    const interestRoles = await ensureCommunityRoles(
      interaction.guild,
      roleConfig.interests,
    );


    const embed = new EmbedBuilder()
      .setColor("#7C3AED")
      .setTitle("🐦‍⬛ The Perch Community Hub")
      .setDescription(
        [
          "Customize your place in **The Perch** using the menus and buttons below.",
          "You can select as many game and interest roles as you like.",
          "",
          "🎮 **Games**",
          "Find other members who play the same games as you.",
          "",
          "🎨 **Interests**",
          "Share what you enjoy outside of gaming.",
          "",
          "📢 **Notifications**",
          "Choose which community updates you want Ray to send your way.",
          "",
          "📈 **Community Progress**",
          "Use `/rank` to view your level and `/leaderboard` to see the server leaders.",
        ].join("\n"),
      )
      .setFooter({
        text: "Update a menu selection or click a notification button again to remove roles.",
      });

    const gameRow = new ActionRowBuilder().addComponents(
      buildRoleMenu("community_games", "🎮 Choose your games...", gameRoles),
    );

    const interestRow = new ActionRowBuilder().addComponents(
      buildRoleMenu(
        "community_interests",
        "🎨 Choose your interests...",
        interestRoles,
      ),
    );

    const notificationRow1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("role_twitch")
        .setLabel("Twitch")
        .setEmoji(roleConfig.twitch.emoji)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("role_youtube")
        .setLabel("YouTube")
        .setEmoji(roleConfig.youtube.emoji)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("role_updates")
        .setLabel("Updates")
        .setEmoji(roleConfig.updates.emoji)
        .setStyle(ButtonStyle.Secondary),
    );

    const notificationRow2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("role_events")
        .setLabel("Events")
        .setEmoji(roleConfig.events.emoji)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("role_revive")
        .setLabel("Chat Revival")
        .setEmoji(roleConfig.revive.emoji)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("role_bump")
        .setLabel("Bump")
        .setEmoji(roleConfig.bump.emoji)
        .setStyle(ButtonStyle.Success),
    );

    await interaction.channel.send({
      embeds: [embed],
      components: [gameRow, interestRow, notificationRow1, notificationRow2],
    });

    return interaction.editReply(
      "✅ The updated Community Hub has been posted. Game and interest roles were created automatically if they did not already exist.",
    );
  },
};
