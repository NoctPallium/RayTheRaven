const ticketService = require("../services/ticketService");

module.exports = {
  async handleStringSelect(interaction) {
    if (interaction.customId !== "ticket_create") return;

    return ticketService.createTicket(interaction);
  },
};
