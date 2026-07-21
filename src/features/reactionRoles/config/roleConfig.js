module.exports = {
  twitch: {
    label: "Twitch Ping",
    emoji: "🎥",
    roleId: process.env.ROLE_TWITCH,
  },

  youtube: {
    label: "YouTube Ping",
    emoji: "▶️",
    roleId: process.env.ROLE_YOUTUBE,
  },

  updates: {
    label: "Updates",
    emoji: "🚀",
    roleId: process.env.ROLE_UPDATES,
  },

  events: {
    label: "Events",
    emoji: "🎉",
    roleId: process.env.ROLE_EVENTS,
  },

  revive: {
    label: "Chat Revival",
    emoji: "💬",
    roleId: process.env.ROLE_REVIVE,
  },

  bump: {
    label: "Bump Reminder",
    emoji: "📈",
    roleId: process.env.ROLE_BUMP,
  },

  games: [
    { key: "marvel_rivals", label: "Marvel Rivals", emoji: "⚔️" },
    { key: "valorant", label: "VALORANT", emoji: "🎯" },
    { key: "minecraft", label: "Minecraft", emoji: "⛏️" },
    { key: "baldurs_gate_3", label: "Baldur's Gate 3", emoji: "🐉" },
    { key: "fortnite", label: "Fortnite", emoji: "🪂" },
    { key: "rocket_league", label: "Rocket League", emoji: "🚗" },
    { key: "rainbow_six_siege", label: "Rainbow Six Siege", emoji: "🛡️" },
  ],

  interests: [
    { key: "coding", label: "Coding", emoji: "💻" },
    { key: "photography", label: "Photography", emoji: "📷" },
    { key: "art", label: "Art", emoji: "🎨" },
    { key: "music", label: "Music", emoji: "🎵" },
    { key: "movies", label: "Movies", emoji: "🎬" },
    { key: "reading", label: "Reading", emoji: "📚" },
    { key: "fitness", label: "Fitness", emoji: "🏋️" },
  ],
};
