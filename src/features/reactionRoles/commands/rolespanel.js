const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");

const config = require("../config/roleConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rolespanel")
    .setDescription("Post the notification roles panel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("#7C3AED")
      .setTitle("🐦‍⬛ Notification Preferences")
      .setDescription(
        [
          "Choose which notifications you'd like to receive.",
          "",
          `${config.twitch.emoji} **${config.twitch.label}**`,
          "Get notified whenever NoctPallium goes live on Twitch.",
          "",
          `${config.youtube.emoji} **${config.youtube.label}**`,
          "Get notified whenever a new YouTube video is uploaded.",
          "",
          `${config.updates.emoji} **${config.updates.label}**`,
          "Receive important server announcements.",
          "",
          `${config.events.emoji} **${config.events.label}**`,
          "Get notified about community events.",
          "",
          `${config.revive.emoji} **${config.revive.label}**`,
          "Volunteer to help revive quiet chats.",
          "",
          `${config.bump.emoji} **${config.bump.label}**`,
          "Receive server bump reminders.",
        ].join("\n"),
      )
      .setFooter({
        text: "Click a button to toggle the corresponding role.",
      });

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("role_twitch")
        .setLabel("Twitch")
        .setEmoji(config.twitch.emoji)
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("role_youtube")
        .setLabel("YouTube")
        .setEmoji(config.youtube.emoji)
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("role_updates")
        .setLabel("Updates")
        .setEmoji(config.updates.emoji)
        .setStyle(ButtonStyle.Secondary),
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("role_events")
        .setLabel("Events")
        .setEmoji(config.events.emoji)
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("role_revive")
        .setLabel("Chat Revival")
        .setEmoji(config.revive.emoji)
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("role_bump")
        .setLabel("Bump")
        .setEmoji(config.bump.emoji)
        .setStyle(ButtonStyle.Success),
    );

    await interaction.reply({
      embeds: [embed],
      components: [row1, row2],
    });
  },
};
