const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const os = require("os");

const Categories = require("../../constants/categories");
const healthStatus = require("../../core/utils/healthStatus");

const STATUS_DISPLAY = {
  online: {
    emoji: "🟢",
    label: "Online",
  },
  starting: {
    emoji: "🟡",
    label: "Starting",
  },
  degraded: {
    emoji: "🟠",
    label: "Degraded",
  },
  offline: {
    emoji: "🔴",
    label: "Offline",
  },
  disabled: {
    emoji: "⚪",
    label: "Disabled",
  },
};

function formatService(service, onlineLabel = "Online") {
  const display = STATUS_DISPLAY[service?.status] || STATUS_DISPLAY.offline;

  const label = service?.status === "online" ? onlineLabel : display.label;

  return `${display.emoji} ${label}`;
}

function getOverallHealth(services) {
  const statuses = Object.values(services).map((service) => service.status);

  if (statuses.includes("offline")) {
    return {
      color: "#EF4444",
      description: "One or more critical systems are offline.",
    };
  }

  if (statuses.includes("degraded")) {
    return {
      color: "#F97316",
      description: "Ray is online, but some services are experiencing issues.",
    };
  }

  if (statuses.includes("starting")) {
    return {
      color: "#EAB308",
      description: "Ray is online and some services are still starting.",
    };
  }

  return {
    color: "#7C3AED",
    description: "All configured systems are operational.",
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("health")
    .setDescription("View Ray's current system status."),

  category: Categories.UTILITY,

  description:
    "Displays Ray's current health, uptime, latency, and system information.",

  usage: "/health",

  permissions: [],

  cooldown: 10,

  async execute(interaction) {
    const client = interaction.client;
    const services = healthStatus.getAllServices();
    const overallHealth = getOverallHealth(services);

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
      .setColor(overallHealth.color)
      .setTitle("🐦‍⬛ Ray Health Report")
      .setDescription(overallHealth.description)
      .addFields(
        {
          name: "🤖 Bot",
          value: "🟢 Online",
          inline: true,
        },
        {
          name: "📡 Ping",
          value:
            client.ws.ping >= 0 ? `${client.ws.ping} ms` : "Calculating...",
          inline: true,
        },
        {
          name: "🗄 Database",
          value: formatService(services.database, "Connected"),
          inline: true,
        },
        {
          name: "🎥 Twitch Monitor",
          value: formatService(services.twitch, "Running"),
          inline: true,
        },
        {
          name: "▶️ YouTube Monitor",
          value: formatService(services.youtube, "Running"),
          inline: true,
        },
        {
          name: "🌐 Servers",
          value: `${client.guilds.cache.size}`,
          inline: true,
        },
        {
          name: "👥 Cached Users",
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
        text: "Ray the Raven • Version 2.0",
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
