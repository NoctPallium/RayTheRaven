const welcomeService = require("../../features/welcome/services/welcomeService");

module.exports = {
  name: "guildMemberAdd",

  async execute(member) {
    await welcomeService(member);
  },
};
