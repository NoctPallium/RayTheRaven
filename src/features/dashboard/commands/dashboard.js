const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const Categories = require("../../../constants/categories");
const healthStatus = require("../../../core/utils/healthStatus");
const { db, getGuildSettings } = require("../../../core/database/database");
function one(sql, params=[]) { return new Promise((resolve,reject)=>db.get(sql,params,(err,row)=>err?reject(err):resolve(row))); }
function icon(service) { return ({online:"🟢",starting:"🟡",degraded:"🟠",offline:"🔴",disabled:"⚪"})[service?.status] || "🔴"; }
module.exports = {
  data: new SlashCommandBuilder().setName("dashboard").setDescription("View Ray's server administration dashboard.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  category: Categories.UTILITY,
  description: "Shows server activity, tickets, configuration, creator monitors, and Ray's health in one place.",
  usage: "/dashboard", permissions: ["Manage Server"], cooldown: 10,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const guildId = interaction.guild.id;
    const [openTickets, closedToday, levelUsers, settings] = await Promise.all([
      one("SELECT COUNT(*) AS count FROM tickets WHERE guild_id = ? AND closed_at IS NULL", [guildId]),
      one("SELECT COUNT(*) AS count FROM tickets WHERE guild_id = ? AND closed_at >= ?", [guildId, Date.now()-86400000]),
      one("SELECT COUNT(*) AS count FROM levels WHERE guild_id = ?", [guildId]),
      getGuildSettings(guildId),
    ]);
    const services = healthStatus.getAllServices();
    const configured = [settings?.welcome_channel_id, settings?.ticket_category_id, settings?.staff_role_id, settings?.auto_role_id].filter(Boolean).length;
    const embed = new EmbedBuilder().setColor("#7C3AED").setTitle("🐦‍⬛ Ray Dashboard")
      .setDescription(`A quick overview of **${interaction.guild.name}**.`)
      .addFields(
        { name: "System Health", value: `Bot 🟢\nDatabase ${icon(services.database)}\nTwitch ${icon(services.twitch)}\nYouTube ${icon(services.youtube)}`, inline: true },
        { name: "Community", value: `Members **${interaction.guild.memberCount}**\nRanked members **${levelUsers?.count || 0}**\nBoosts **${interaction.guild.premiumSubscriptionCount || 0}**`, inline: true },
        { name: "Tickets", value: `Open **${openTickets?.count || 0}**\nClosed in 24h **${closedToday?.count || 0}**`, inline: true },
        { name: "Setup", value: `${configured}/4 core settings configured\nUse \`/setup\` to make changes.`, inline: false },
        { name: "Quick Commands", value: "`/health` • `/stats` • `/leaderboard` • `/setup`", inline: false },
      ).setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  },
};
