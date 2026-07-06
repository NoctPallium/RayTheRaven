const { EmbedBuilder } = require("discord.js");
const colors = require("../config/colors");

function createEmbed() {
  return new EmbedBuilder()
    .setColor(colors.primary)
    .setFooter({
      text: "🐦‍⬛ Ray • The Perch",
    })
    .setTimestamp();
}

module.exports = createEmbed;
