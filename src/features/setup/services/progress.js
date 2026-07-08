const { getGuildSettings } = require("../../../core/database/database");

async function getProgress(guildId) {
  const settings = await getGuildSettings(guildId);

  return {
    welcome: Boolean(settings?.welcome_channel_id && settings?.log_channel_id),

    tickets: Boolean(settings?.ticket_category_id && settings?.staff_role_id),

    roles: Boolean(settings?.auto_role_id),
  };
}

module.exports = getProgress;
