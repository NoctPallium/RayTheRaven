const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const Categories = require("../../../constants/categories");
module.exports = {
  data: new SlashCommandBuilder().setName("avatar").setDescription("View a user's avatar.")
    .addUserOption((option) => option.setName("user").setDescription("The user whose avatar you want to view.")),
  category: Categories.UTILITY,
  description: "Displays a user's global avatar and server avatar when one is set.",
  usage: "/avatar [user]", permissions: [], cooldown: 3,
  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id).catch(() => null);
    const globalUrl = user.displayAvatarURL({ extension: "png", size: 4096 });
    const serverUrl = member?.avatarURL({ extension: "png", size: 4096 });
    const shownUrl = serverUrl || globalUrl;
    const embed = new EmbedBuilder().setColor(member?.displayColor || "#7C3AED").setTitle(`🖼️ ${user.username}'s Avatar`)
      .setImage(shownUrl).setDescription(serverUrl ? "Showing this user's server-specific avatar." : "Showing this user's global avatar.");
    const buttons = [new ButtonBuilder().setLabel("Open Avatar").setStyle(ButtonStyle.Link).setURL(shownUrl)];
    if (serverUrl && serverUrl !== globalUrl) buttons.push(new ButtonBuilder().setLabel("Global Avatar").setStyle(ButtonStyle.Link).setURL(globalUrl));
    await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(buttons)] });
  },
};
