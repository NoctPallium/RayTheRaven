const welcome = require("./welcome");
const tickets = require("./tickets");
const roles = require("./roles");

// =========================================
// Buttons
// =========================================

async function handleButton(interaction) {
  switch (interaction.customId) {
    case "setup_welcome":
      return welcome.handleButton(interaction);

    case "setup_tickets":
      return tickets.handleButton(interaction);

    case "setup_roles":
      return roles.handleButton(interaction);

    case "setup_finish":
      return interaction.update({
        content: "✅ Ray setup has been completed successfully!",
        embeds: [],
        components: [],
      });
  }
}

// =========================================
// Channel Select Menus
// =========================================

async function handleChannelSelect(interaction) {
  if (
    interaction.customId === "setup_select_welcome" ||
    interaction.customId === "setup_select_logs"
  ) {
    return welcome.handleChannelSelect(interaction);
  }

  if (interaction.customId === "setup_select_ticket_category") {
    return tickets.handleChannelSelect(interaction);
  }
}

// =========================================
// Role Select Menus
// =========================================

async function handleRoleSelect(interaction) {
  if (interaction.customId === "setup_select_staff_role") {
    return tickets.handleRoleSelect(interaction);
  }

  if (interaction.customId === "setup_select_auto_role") {
    return roles.handleRoleSelect(interaction);
  }
}

module.exports = {
  handleButton,
  handleChannelSelect,
  handleRoleSelect,
};
