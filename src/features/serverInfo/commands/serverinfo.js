const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require("discord.js");
const Categories = require("../../../constants/categories");
module.exports = {
  data: new SlashCommandBuilder().setName("serverinfo").setDescription("View information about this Discord server."),
  category: Categories.UTILITY,
  description: "Displays the server owner, creation date, members, channels, roles, boosts, and verification level.",
  usage: "/serverinfo", permissions: [], cooldown: 5,
  async execute(interaction) {
    const guild = interaction.guild;
    await guild.fetch();
    const owner = await guild.fetchOwner().catch(() => null);
    const channels = guild.channels.cache;
    const textCount = channels.filter((c) => [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum].includes(c.type)).size;
    const voiceCount = channels.filter((c) => [ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(c.type)).size;
    const bots = guild.members.cache.filter((member) => member.user.bot).size;
    const created = Math.floor(guild.createdTimestamp / 1000);
    const embed = new EmbedBuilder().setColor("#7C3AED").setTitle(`🏠 ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 512 }))
      .addFields(
        { name: "Owner", value: owner ? `${owner}` : "Unavailable", inline: true },
        { name: "Created", value: `<t:${created}:D>\n<t:${created}:R>`, inline: true },
        { name: "Server ID", value: guild.id, inline: true },
        { name: "Members", value: `${guild.memberCount}`, inline: true },
        { name: "Bots", value: `${bots}`, inline: true },
        { name: "Boosts", value: `${guild.premiumSubscriptionCount || 0} • Tier ${guild.premiumTier}`, inline: true },
        { name: "Channels", value: `${textCount} text • ${voiceCount} voice`, inline: true },
        { name: "Roles", value: `${Math.max(guild.roles.cache.size - 1, 0)}`, inline: true },
        { name: "Emojis", value: `${guild.emojis.cache.size}`, inline: true },
        { name: "Verification", value: String(guild.verificationLevel), inline: true },
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
