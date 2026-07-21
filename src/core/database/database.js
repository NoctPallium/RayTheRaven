const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const healthStatus = require("../utils/healthStatus");
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
  CREATE TABLE IF NOT EXISTS app_state (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`);
  // -----------------------------
  // Guild Settings
  // -----------------------------
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

  // -----------------------------
  // Tickets
  // -----------------------------
  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      channel_id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      creator_id TEXT NOT NULL,
      ticket_type TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      closed_at INTEGER
    )
  `);
});

// =====================================
// Guild Settings
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

// =====================================
// Tickets
// =====================================

function createTicket(ticket) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO tickets
      (channel_id, guild_id, creator_id, ticket_type, created_at)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        ticket.channel_id,
        ticket.guild_id,
        ticket.creator_id,
        ticket.ticket_type,
        ticket.created_at,
      ],
      (err) => {
        if (err) return reject(err);

        resolve();
      },
    );
  });
}

function getOpenTicket(guildId, creatorId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT *
      FROM tickets
      WHERE guild_id = ?
      AND creator_id = ?
      AND closed_at IS NULL
      `,
      [guildId, creatorId],
      (err, row) => {
        if (err) return reject(err);

        resolve(row);
      },
    );
  });
}

function getTicketByChannel(channelId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT *
      FROM tickets
      WHERE channel_id = ?
      `,
      [channelId],
      (err, row) => {
        if (err) return reject(err);

        resolve(row);
      },
    );
  });
}

function closeTicket(channelId) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      UPDATE tickets
      SET closed_at = ?
      WHERE channel_id = ?
      `,
      [Date.now(), channelId],
      (err) => {
        if (err) return reject(err);

        resolve();
      },
    );
  });
}
db.run(`
  CREATE TABLE IF NOT EXISTS levels (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,

    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,
    last_message INTEGER DEFAULT 0,

    PRIMARY KEY (guild_id, user_id)
  )
`);
// =====================================
// Exports
// =====================================
function getLevel(guildId, userId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT *
      FROM levels
      WHERE guild_id = ?
      AND user_id = ?
      `,
      [guildId, userId],
      (err, row) => {
        if (err) return reject(err);

        resolve(row);
      },
    );
  });
}

function createLevel(guildId, userId) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT OR IGNORE INTO levels
      (guild_id, user_id)
      VALUES (?, ?)
      `,
      [guildId, userId],
      (err) => {
        if (err) return reject(err);

        resolve();
      },
    );
  });
}

function updateLevel(guildId, userId, xp, level, lastMessage) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      UPDATE levels
      SET xp = ?,
          level = ?,
          last_message = ?
      WHERE guild_id = ?
      AND user_id = ?
      `,
      [xp, level, lastMessage, guildId, userId],
      (err) => {
        if (err) return reject(err);

        resolve();
      },
    );
  });
}
// =====================================
// Leaderboard
// =====================================

function getLeaderboard(guildId, limit = 10) {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT
        guild_id,
        user_id,
        level,
        xp
      FROM levels
      WHERE guild_id = ?
      ORDER BY level DESC, xp DESC
      LIMIT ?
      `,
      [guildId, limit],
      (err, rows) => {
        if (err) return reject(err);

        resolve(rows);
      },
    );
  });
}
function getState(key) {
  return new Promise((resolve, reject) => {
    db.get("SELECT value FROM app_state WHERE key = ?", [key], (err, row) => {
      if (err) return reject(err);
      resolve(row?.value ?? null);
    });
  });
}

function setState(key, value) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO app_state (key, value)
      VALUES (?, ?)
      ON CONFLICT(key)
      DO UPDATE SET value = excluded.value
      `,
      [key, value],
      (err) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
}
module.exports = {
  db,

  // Application State
  getState,
  setState,

  // Levels
  getLevel,
  createLevel,
  updateLevel,
  getLeaderboard,

  // Guild Settings
  getGuildSettings,
  updateGuildSetting,

  // Tickets
  createTicket,
  getOpenTicket,
  getTicketByChannel,
  closeTicket,
};
