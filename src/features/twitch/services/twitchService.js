const { EmbedBuilder } = require("discord.js");
const { getState, setState } = require("../../../core/database/database");

let accessToken = null;
let tokenExpiresAt = 0;

function validateTwitchConfig() {
  const requiredVariables = [
    "TWITCH_CLIENT_ID",
    "TWITCH_CLIENT_SECRET",
    "TWITCH_CHANNEL",
    "TWITCH_NOTIFY_CHANNEL_ID",
  ];

  const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable],
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing Twitch configuration: ${missingVariables.join(", ")}`,
    );
  }
}

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  const query = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWITCH_CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?${query.toString()}`,
    {
      method: "POST",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Twitch authentication failed: ${data.message || response.statusText}`,
    );
  }

  if (!data.access_token || !data.expires_in) {
    throw new Error("Twitch returned an invalid access token response.");
  }

  accessToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000 - 60000;

  return accessToken;
}

async function requestTwitch(endpoint) {
  const token = await getAccessToken();

  const response = await fetch(`https://api.twitch.tv/helix/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-Id": process.env.TWITCH_CLIENT_ID,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Twitch API request failed: ${data.message || response.statusText}`,
    );
  }

  return data;
}

async function getBroadcaster() {
  const login = encodeURIComponent(process.env.TWITCH_CHANNEL);
  const data = await requestTwitch(`users?login=${login}`);

  return data.data?.[0] ?? null;
}

async function getStream() {
  const login = encodeURIComponent(process.env.TWITCH_CHANNEL);
  const data = await requestTwitch(`streams?user_login=${login}`);

  return data.data?.[0] ?? null;
}

async function getNotificationChannel(client) {
  const channelId = process.env.TWITCH_NOTIFY_CHANNEL_ID;

  const channel =
    client.channels.cache.get(channelId) ||
    (await client.channels.fetch(channelId).catch(() => null));

  if (!channel) {
    throw new Error(`Twitch notification channel ${channelId} was not found.`);
  }

  if (!channel.isTextBased()) {
    throw new Error("The Twitch notification channel is not text-based.");
  }

  return channel;
}

async function checkTwitchLive(client) {
  validateTwitchConfig();

  const channel = await getNotificationChannel(client);
  const stream = await getStream();

  // A successful response with no stream means the channel is offline.
  if (!stream) {
    return {
      live: false,
    };
  }

  const lastStreamId = await getState("last_twitch_stream_id");

  if (lastStreamId === stream.id) {
    return {
      live: true,
      alreadyAnnounced: true,
    };
  }

  const broadcaster = await getBroadcaster();

  const ping = process.env.TWITCH_PING_ROLE_ID
    ? `<@&${process.env.TWITCH_PING_ROLE_ID}>`
    : undefined;

  const embed = new EmbedBuilder()
    .setColor("#9146FF")
    .setTitle("🔴 NoctPallium is LIVE!")
    .setURL(`https://twitch.tv/${process.env.TWITCH_CHANNEL}`)
    .setDescription(
      [
        `**${stream.title || "Live on Twitch"}**`,
        "",
        `🎮 **Playing:** ${stream.game_name || "Unknown"}`,
        "",
        `[Watch now](https://twitch.tv/${process.env.TWITCH_CHANNEL})`,
      ].join("\n"),
    )
    .setImage(
      stream.thumbnail_url
        .replace("{width}", "1280")
        .replace("{height}", "720"),
    )
    .setFooter({
      text: "Ray Twitch Alerts",
    })
    .setTimestamp();

  if (broadcaster?.profile_image_url) {
    embed.setThumbnail(broadcaster.profile_image_url);
  }

  await channel.send({
    content: ping,
    embeds: [embed],
  });

  // Save only after Discord successfully receives the notification.
  await setState("last_twitch_stream_id", stream.id);

  return {
    live: true,
    announced: true,
  };
}

module.exports = {
  checkTwitchLive,
};
