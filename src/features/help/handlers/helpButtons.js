const helpView = require("./helpView");
module.exports = async function handleHelpButton(interaction) {
  if (interaction.customId === "help_home") return interaction.update(helpView.home(interaction.client));
  if (interaction.customId.startsWith("help_category:")) {
    const category = interaction.customId.slice("help_category:".length);
    return interaction.update(helpView.category(interaction.client, category));
  }
};
