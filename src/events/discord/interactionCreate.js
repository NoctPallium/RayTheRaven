const setupService = require("../../features/setup/services");
const ticketInteraction = require("../../features/tickets/events/ticketInteraction");
const ticketButtons = require("../../features/tickets/events/ticketButtons");

const roleButtons = require("../../features/reactionRoles/handlers/buttonHandler");

module.exports = {
  name: "interactionCreate",

  async execute(interaction) {
    try {
      // ==========================================
      // Slash Commands
      // ==========================================

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

      // ==========================================
      // Buttons
      // ==========================================

      if (interaction.isButton()) {
        // Setup Buttons
        if (interaction.customId.startsWith("setup_")) {
          return await setupService.handleButton(interaction);
        }

        // Ticket Buttons
        if (interaction.customId.startsWith("ticket_")) {
          return await ticketButtons.handleButton(interaction);
        }

        // Notification Role Buttons
        if (interaction.customId.startsWith("role_")) {
          return await roleButtons(interaction);
        }

        return;
      }

      // ==========================================
      // Channel Select Menus
      // ==========================================

      if (interaction.isChannelSelectMenu()) {
        return await setupService.handleChannelSelect(interaction);
      }

      // ==========================================
      // Role Select Menus
      // ==========================================

      if (interaction.isRoleSelectMenu()) {
        return await setupService.handleRoleSelect(interaction);
      }

      // ==========================================
      // String Select Menus
      // ==========================================

      if (interaction.isStringSelectMenu()) {
        return await ticketInteraction.handleStringSelect(interaction);
      }
    } catch (error) {
      console.error(error);

      const response = {
        content: "❌ There was an error executing this interaction.",
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(response).catch(() => {});
      } else {
        await interaction.reply(response).catch(() => {});
      }
    }
  },
};
