const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

function buildHub(options = {}) {
  const { welcome = false, tickets = false, roles = false } = options;

  const embed = new EmbedBuilder()
    .setColor("#7C3AED")
    .setTitle("🐦‍⬛ Ray Configuration")
    .setDescription(
      [
        "Welcome to **Ray's Configuration Hub**.",
        "",
        "Choose what you'd like to configure.",
        "",
        `${welcome ? "✅" : "👋"} **Welcome**`,
        "Configure welcome & log channels.",
        "",
        `${tickets ? "✅" : "🎫"} **Tickets**`,
        "Configure ticket category & staff role.",
        "",
        `${roles ? "✅" : "🛡️"} **Roles**`,
        "Configure the automatic member role.",
      ].join("\n"),
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("setup_welcome")
      .setLabel("Welcome")
      .setEmoji(welcome ? "✅" : "👋")
      .setStyle(welcome ? ButtonStyle.Success : ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("setup_tickets")
      .setLabel("Tickets")
      .setEmoji(tickets ? "✅" : "🎫")
      .setStyle(tickets ? ButtonStyle.Success : ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("setup_roles")
      .setLabel("Roles")
      .setEmoji(roles ? "✅" : "🛡️")
      .setStyle(roles ? ButtonStyle.Success : ButtonStyle.Primary),
  );

  return {
    embeds: [embed],
    components: [row],
  };
}

module.exports = buildHub;
