const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Categories = require("../../../constants/categories");

const ORDER = [Categories.UTILITY, Categories.COMMUNITY, Categories.FUN, Categories.MODERATION, Categories.ADMIN];
const ICONS = { Utility: "📖", Community: "👥", Fun: "🎮", Moderation: "🛡️", Administration: "⚙️" };

function visibleCommands(client) {
  return [...client.commands.values()].filter((command) => command?.data?.name && command.category);
}

function categoryRows(client) {
  const categories = [...new Set(visibleCommands(client).map((command) => command.category))]
    .sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  const buttons = categories.map((category) => new ButtonBuilder()
    .setCustomId(`help_category:${category}`)
    .setLabel(category)
    .setEmoji(ICONS[category] || "📄")
    .setStyle(ButtonStyle.Secondary));
  const rows = [];
  for (let i = 0; i < buttons.length; i += 5) rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
  return rows;
}

function home(client) {
  const commands = visibleCommands(client);
  const counts = ORDER.map((category) => {
    const count = commands.filter((command) => command.category === category).length;
    return count ? `${ICONS[category]} **${category}** — ${count}` : null;
  }).filter(Boolean);
  return {
    embeds: [new EmbedBuilder()
      .setColor("#7C3AED")
      .setTitle("🐦‍⬛ Ray's Field Guide")
      .setDescription(["Select a category below to browse Ray's commands.", "", ...counts].join("\n"))
      .setFooter({ text: `${commands.length} commands loaded • Use /help command:<name> for details` })],
    components: categoryRows(client),
  };
}

function category(client, categoryName) {
  const commands = visibleCommands(client)
    .filter((command) => command.category === categoryName)
    .sort((a, b) => a.data.name.localeCompare(b.data.name));
  const description = commands.length
    ? commands.map((command) => `**/${command.data.name}**\n${command.description || command.data.description}`).join("\n\n")
    : "No commands are currently available in this category.";
  return {
    embeds: [new EmbedBuilder()
      .setColor("#7C3AED")
      .setTitle(`${ICONS[categoryName] || "📄"} ${categoryName} Commands`)
      .setDescription(description)
      .setFooter({ text: `${commands.length} command${commands.length === 1 ? "" : "s"}` })],
    components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("help_home").setLabel("Home").setEmoji("⬅️").setStyle(ButtonStyle.Primary),
    )],
  };
}

function details(command) {
  const permissions = Array.isArray(command.permissions) && command.permissions.length ? command.permissions.join(", ") : "Everyone";
  return {
    embeds: [new EmbedBuilder()
      .setColor("#7C3AED")
      .setTitle(`🐦‍⬛ /${command.data.name}`)
      .setDescription(command.description || command.data.description)
      .addFields(
        { name: "Usage", value: `\`${command.usage || `/${command.data.name}`}\``, inline: false },
        { name: "Category", value: command.category || "Uncategorized", inline: true },
        { name: "Permissions", value: permissions, inline: true },
        { name: "Cooldown", value: `${command.cooldown ?? 0} seconds`, inline: true },
      )],
    components: [],
  };
}

module.exports = { home, category, details };
