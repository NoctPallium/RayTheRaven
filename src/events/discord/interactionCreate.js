const setupService = require("../../features/setup/services/setupServices");

module.exports = {
  name: "interactionCreate",

  async execute(interaction) {
    try {
      // ==========================
      // Slash Commands
      // ==========================

      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(
          interaction.commandName,
        );

        if (!command) {
          console.error(
            `No command matching ${interaction.commandName} was found.`,
          );
          return;
        }

        return await command.execute(interaction);
      }

      // ==========================
      // Setup Buttons
      // ==========================

      if (interaction.isButton()) {
        return await setupService.handleButton(interaction);
      }

      // ==========================
      // Setup Select Menus
      // ==========================

      if (interaction.isChannelSelectMenu()) {
        return await setupService.handleChannelSelect(interaction);
      }

      if (interaction.isRoleSelectMenu()) {
        return await setupService.handleRoleSelect(interaction);
      }
    } catch (error) {
      console.error(error);

      const response = {
        content: "❌ There was an error executing this interaction.",
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(response);
      } else {
        await interaction.reply(response);
      }
    }
  },
};
