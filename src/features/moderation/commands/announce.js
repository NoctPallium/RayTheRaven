const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const Categories = require("../../../constants/categories");
module.exports = {
  data: new SlashCommandBuilder().setName("announce").setDescription("Send an announcement through Ray.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(o=>o.setName("message").setDescription("Announcement text.").setRequired(true).setMaxLength(4000))
    .addChannelOption(o=>o.setName("channel").setDescription("Channel to post in; defaults to the current channel."))
    .addRoleOption(o=>o.setName("ping").setDescription("Optional role to mention.")),
  category: Categories.MODERATION, description: "Posts a polished announcement embed in a selected channel.",
  usage: "/announce message:<text> [channel] [ping]", permissions:["Manage Messages"], cooldown:5,
  async execute(i){const channel=i.options.getChannel("channel")||i.channel;const role=i.options.getRole("ping");if(!channel?.isTextBased())return i.reply({content:"❌ Choose a text-based channel.",ephemeral:true});const embed=new EmbedBuilder().setColor("#7C3AED").setTitle("📢 Announcement").setDescription(i.options.getString("message")).setFooter({text:`Posted by ${i.user.username}`}).setTimestamp();await channel.send({content:role?`${role}`:undefined,embeds:[embed],allowedMentions:{roles:role?[role.id]:[]}});await i.reply({content:`✅ Announcement sent in ${channel}.`,ephemeral:true});}
};
