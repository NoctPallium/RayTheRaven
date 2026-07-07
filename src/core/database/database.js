const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../../../ray.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to SQLite:", err.message);
  } else {
    console.log("✅ Connected to SQLite.");
  }
});

// =====================================
// Initialize Database
// =====================================

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,

      welcome_channel_id TEXT,
      log_channel_id TEXT,

      ticket_category_id TEXT,
      staff_role_id TEXT,
      auto_role_id TEXT,

      twitch_channel_id TEXT,
      youtube_channel_id TEXT
    )
  `);
});

// =====================================
// Database Helpers
// =====================================

function getGuildSettings(guildId) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM guild_settings WHERE guild_id = ?",
      [guildId],
      (err, row) => {
        if (err) return reject(err);

        resolve(row);
      },
    );
  });
}

function updateGuildSetting(guildId, column, value) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO guild_settings (guild_id, ${column})
      VALUES (?, ?)
      ON CONFLICT(guild_id)
      DO UPDATE SET ${column}=excluded.${column}
      `,
      [guildId, value],
      (err) => {
        if (err) return reject(err);

        resolve();
      },
    );
  });
}

module.exports = {
  db,
  getGuildSettings,
  updateGuildSetting,
};
