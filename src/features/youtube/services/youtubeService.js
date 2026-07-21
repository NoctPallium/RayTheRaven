const { EmbedBuilder } = require("discord.js");
const { getState, setState } = require("../../../core/database/database");

function validateYouTubeConfig() {
  const requiredVariables = ["YOUTUBE_CHANNEL_ID", "YOUTUBE_NOTIFY_CHANNEL_ID"];

  const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable],
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing YouTube configuration: ${missingVariables.join(", ")}`,
    );
  }
}

function getXmlValue(xml, tag) {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(
    new RegExp(`<${escapedTag}[^>]*>(.*?)</${escapedTag}>`, "s"),
  );

  return match?.[1]?.trim() ?? null;
}

function getFirstEntry(xml) {
  const match = xml.match(/<entry>(.*?)<\/entry>/s);
  return match?.[1] ?? null;
}

function decodeXml(value) {
  if (!value) return value;

  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

async function getNotificationChannel(client) {
  const channelId = process.env.YOUTUBE_NOTIFY_CHANNEL_ID;

  const channel =
    client.channels.cache.get(channelId) ||
    (await client.channels.fetch(channelId).catch(() => null));

  if (!channel) {
    throw new Error(`YouTube notification channel ${channelId} was not found.`);
  }

  if (!channel.isTextBased()) {
    throw new Error("The YouTube notification channel is not text-based.");
  }

  return channel;
}

async function checkYouTubeUpload(client) {
  validateYouTubeConfig();

  const discordChannel = await getNotificationChannel(client);
  const youtubeChannelId = encodeURIComponent(process.env.YOUTUBE_CHANNEL_ID);

  const response = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${youtubeChannelId}`,
  );

  if (!response.ok) {
    throw new Error(
      `YouTube feed request failed: ${response.status} ${response.statusText}`,
    );
  }

  const xml = await response.text();
  const entry = getFirstEntry(xml);

  if (!entry) {
    throw new Error("The YouTube feed did not contain any video entries.");
  }

  const videoId = getXmlValue(entry, "yt:videoId");
  const title = decodeXml(getXmlValue(entry, "title"));

  if (!videoId || !title) {
    throw new Error("The YouTube feed contained an invalid video entry.");
  }

  const lastVideoId = await getState("last_youtube_video_id");

  if (lastVideoId === videoId) {
    return {
      newUpload: false,
    };
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const embed = new EmbedBuilder()
    .setColor("#FF0000")
    .setTitle("▶️ New YouTube Upload!")
    .setURL(videoUrl)
    .setDescription([`**${title}**`, "", `[Watch now](${videoUrl})`].join("\n"))
    .setImage(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)
    .setFooter({
      text: "Ray YouTube Alerts",
    })
    .setTimestamp();

  await discordChannel.send({
    embeds: [embed],
  });

  // Save only after the Discord notification succeeds.
  await setState("last_youtube_video_id", videoId);

  return {
    newUpload: true,
    announced: true,
  };
}

module.exports = {
  checkYouTubeUpload,
};
