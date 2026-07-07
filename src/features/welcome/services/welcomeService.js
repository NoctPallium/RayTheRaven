const fs = require("fs");

const logger = require("../../../core/utils/logger");
const config = require("../../../core/config/serverConfig");
const generateWelcomeImage = require("../rendering/imageGenerator");

module.exports = async (member) => {
  const channel = member.guild.channels.cache.get(config.welcomeChannelId);

  if (!channel) {
    logger.warn("Welcome channel not found.");
    return;
  }

  try {
    const imagePath = await generateWelcomeImage(member);

    await channel.send({
      content:
        `## 🐦‍⬛ Welcome to **The Perch**, ${member}!\n` +
        `We're glad you're here. Make yourself at home!`,
      files: [
        {
          attachment: imagePath,
          name: "welcome.png",
        },
      ],
    });

    // Delete the temporary image after Discord uploads it
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    logger.info(`Welcome card sent for ${member.user.tag}`);
  } catch (error) {
    logger.error(error);
  }
};
