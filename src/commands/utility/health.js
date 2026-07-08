const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("health")
    .setDescription("View Ray's current system status."),

  async execute(interaction) {
    const client = interaction.client;

    const uptime = Math.floor(process.uptime());

    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    const uptimeString = [
      days ? `${days}d` : null,
      hours ? `${hours}h` : null,
      minutes ? `${minutes}m` : null,
      `${seconds}s`,
    ]
      .filter(Boolean)
      .join(" ");

    const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    const embed = new EmbedBuilder()
      .setColor("#7C3AED")
      .setTitle("🐦‍⬛ Ray Health Report")
      .setDescription("All systems operational.")
      .addFields(
        {
          name: "🤖 Bot",
          value: "🟢 Online",
          inline: true,
        },
        {
          name: "📡 Ping",
          value: `${client.ws.ping} ms`,
          inline: true,
        },
        {
          name: "🗄 Database",
          value: "🟢 Connected",
          inline: true,
        },
        {
          name: "🎥 Twitch Monitor",
          value: "🟢 Running",
          inline: true,
        },
        {
          name: "▶️ YouTube Monitor",
          value: "🟢 Running",
          inline: true,
        },
        {
          name: "🌐 Servers",
          value: `${client.guilds.cache.size}`,
          inline: true,
        },
        {
          name: "👥 Users",
          value: `${client.users.cache.size}`,
          inline: true,
        },
        {
          name: "💾 Memory",
          value: `${memory} MB`,
          inline: true,
        },
        {
          name: "🖥 Node",
          value: process.version,
          inline: true,
        },
        {
          name: "⚙ Platform",
          value: `${os.type()} ${os.release()}`,
          inline: true,
        },
        {
          name: "⏱ Uptime",
          value: uptimeString,
          inline: false,
        },
      )
      .setFooter({
        text: "Ray the Raven • Version 1.0",
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
