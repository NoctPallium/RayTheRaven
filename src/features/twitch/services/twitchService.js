const { EmbedBuilder } = require("discord.js");

const { getState, setState } = require("../../../core/database/database");

let accessToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiresAt) return accessToken;

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" },
  );

  const data = await res.json();

  accessToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000 - 60000;

  return accessToken;
}

async function getBroadcaster() {
  const token = await getAccessToken();

  const res = await fetch(
    `https://api.twitch.tv/helix/users?login=${process.env.TWITCH_CHANNEL}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": process.env.TWITCH_CLIENT_ID,
      },
    },
  );

  const data = await res.json();
  return data.data?.[0];
}

async function getStream() {
  const token = await getAccessToken();

  const res = await fetch(
    `https://api.twitch.tv/helix/streams?user_login=${process.env.TWITCH_CHANNEL}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": process.env.TWITCH_CLIENT_ID,
      },
    },
  );

  const data = await res.json();
  return data.data?.[0] ?? null;
}

async function checkTwitchLive(client) {
  const channel = client.channels.cache.get(
    process.env.TWITCH_NOTIFY_CHANNEL_ID,
  );

  if (!channel) return;

  const stream = await getStream();

  if (!stream) return;

  const lastStreamId = await getState("last_twitch_stream_id");

  if (lastStreamId === stream.id) return;

  await setState("last_twitch_stream_id", stream.id);

  const broadcaster = await getBroadcaster();

  const ping = process.env.TWITCH_PING_ROLE_ID
    ? `<@&${process.env.TWITCH_PING_ROLE_ID}>`
    : "";

  const embed = new EmbedBuilder()
    .setColor("#9146FF")
    .setTitle("🔴 NoctPallium is LIVE!")
    .setURL(`https://twitch.tv/${process.env.TWITCH_CHANNEL}`)
    .setDescription(
      [
        `**${stream.title}**`,
        "",
        `🎮 **Playing:** ${stream.game_name}`,
        "",
        `[Watch now](https://twitch.tv/${process.env.TWITCH_CHANNEL})`,
      ].join("\n"),
    )
    .setThumbnail(broadcaster?.profile_image_url ?? null)
    .setImage(
      stream.thumbnail_url
        .replace("{width}", "1280")
        .replace("{height}", "720"),
    )
    .setFooter({
      text: "Ray Twitch Alerts",
    })
    .setTimestamp();

  await channel.send({
    content: ping,
    embeds: [embed],
  });
}

module.exports = {
  checkTwitchLive,
};
