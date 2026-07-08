const ticketService = require("../services/ticketService");

module.exports = {
  async handleButton(interaction) {
    if (interaction.customId !== "ticket_close") return;

    return ticketService.closeTicket(interaction);
  },
};
