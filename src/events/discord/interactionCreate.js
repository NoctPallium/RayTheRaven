const setupService = require("../../features/setup/services");
const ticketInteraction = require("../../features/tickets/events/ticketInteraction");
const ticketButtons = require("../../features/tickets/events/ticketButtons");

const roleButtons = require("../../features/reactionRoles/handlers/buttonHandler");
const helpButtons = require("../../features/help/handlers/helpButtons");
const communityRoleMenus = require("../../features/communityHub/handlers/communityRoleMenus");

module.exports = {
  name: "interactionCreate",

  async execute(interaction) {
    try {
      if (interaction.isAutocomplete()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command?.autocomplete) return;
        return await command.autocomplete(interaction);
      }

      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
          console.error(`No command matching ${interaction.commandName} was found.`);
          return;
        }

        return await command.execute(interaction);
      }

      if (interaction.isButton()) {
        if (interaction.customId.startsWith("help_")) {
          return await helpButtons(interaction);
        }

        if (interaction.customId.startsWith("setup_")) {
          return await setupService.handleButton(interaction);
        }

        if (interaction.customId.startsWith("ticket_")) {
          return await ticketButtons.handleButton(interaction);
        }

        if (interaction.customId.startsWith("role_")) {
          return await roleButtons(interaction);
        }

        return;
      }

      if (interaction.isChannelSelectMenu()) {
        return await setupService.handleChannelSelect(interaction);
      }

      if (interaction.isRoleSelectMenu()) {
        return await setupService.handleRoleSelect(interaction);
      }

      if (interaction.isStringSelectMenu()) {
        if (interaction.customId.startsWith("community_")) {
          return await communityRoleMenus(interaction);
        }

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
