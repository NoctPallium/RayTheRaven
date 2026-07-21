const { SlashCommandBuilder } = require("discord.js");
const Categories = require("../../../constants/categories");
const helpView = require("../handlers/helpView");
module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("Browse Ray's commands and usage information.")
    .addStringOption((option) => option.setName("command").setDescription("View details for one command.").setAutocomplete(true)),
  category: Categories.UTILITY,
  description: "Opens Ray's interactive command guide or shows details for one command.",
  usage: "/help [command]",
  permissions: [], cooldown: 3,
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    const choices = [...interaction.client.commands.values()]
      .filter((command) => command.data.name.includes(focused))
      .sort((a, b) => a.data.name.localeCompare(b.data.name)).slice(0, 25)
      .map((command) => ({ name: `/${command.data.name} — ${command.data.description}`.slice(0, 100), value: command.data.name }));
    await interaction.respond(choices);
  },
  async execute(interaction) {
    const name = interaction.options.getString("command");
    if (name) {
      const command = interaction.client.commands.get(name.toLowerCase());
      if (!command) return interaction.reply({ content: "❌ I couldn't find that command.", ephemeral: true });
      return interaction.reply({ ...helpView.details(command), ephemeral: true });
    }
    return interaction.reply({ ...helpView.home(interaction.client), ephemeral: true });
  },
};
