const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const os = require("os");
const fs = require("fs");
const path = require("path");
const Categories = require("../../../constants/categories");
function uptime(seconds) { const d=Math.floor(seconds/86400); const h=Math.floor(seconds%86400/3600); const m=Math.floor(seconds%3600/60); const s=Math.floor(seconds%60); return [d&&`${d}d`,h&&`${h}h`,m&&`${m}m`,`${s}s`].filter(Boolean).join(" "); }
module.exports = {
  data: new SlashCommandBuilder().setName("stats").setDescription("View statistics about Ray."),
  category: Categories.UTILITY,
  description: "Displays Ray's uptime, memory usage, loaded commands, servers, users, and database size.",
  usage: "/stats", permissions: [], cooldown: 5,
  async execute(interaction) {
    const dbPath = path.join(__dirname, "../../../../ray.db");
    const dbSize = fs.existsSync(dbPath) ? `${(fs.statSync(dbPath).size / 1024).toFixed(1)} KB` : "Unavailable";
    const memory = process.memoryUsage();
    const embed = new EmbedBuilder().setColor("#7C3AED").setTitle("📊 Ray Statistics")
      .addFields(
        { name: "Commands", value: `${interaction.client.commands.size}`, inline: true },
        { name: "Servers", value: `${interaction.client.guilds.cache.size}`, inline: true },
        { name: "Cached Users", value: `${interaction.client.users.cache.size}`, inline: true },
        { name: "Uptime", value: uptime(process.uptime()), inline: true },
        { name: "WebSocket Ping", value: `${interaction.client.ws.ping} ms`, inline: true },
        { name: "Heap Memory", value: `${(memory.heapUsed/1024/1024).toFixed(1)} / ${(memory.heapTotal/1024/1024).toFixed(1)} MB`, inline: true },
        { name: "Database", value: dbSize, inline: true },
        { name: "Node.js", value: process.version, inline: true },
        { name: "Platform", value: `${os.type()} ${os.arch()}`, inline: true },
      ).setFooter({ text: "Ray the Raven • 2.0" }).setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
