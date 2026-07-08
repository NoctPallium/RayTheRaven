const levelingService = require("../services/levelingService");

module.exports = {
  name: "messageCreate",

  async execute(message) {
    await levelingService.addXP(message);
  },
};
