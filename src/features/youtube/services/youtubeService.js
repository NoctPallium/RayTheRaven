const { EmbedBuilder } = require("discord.js");

const { getState, setState } = require("../../../core/database/database");

function getXmlValue(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`, "s"));
  return match?.[1]?.trim() ?? null;
}

function getFirstEntry(xml) {
  const match = xml.match(/<entry>(.*?)<\/entry>/s);
  return match?.[1] ?? null;
}

async function checkYouTubeUpload(client) {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  const notifyChannelId = process.env.YOUTUBE_NOTIFY_CHANNEL_ID;

  if (!channelId || !notifyChannelId) return;

  const discordChannel = client.channels.cache.get(notifyChannelId);
  if (!discordChannel) return;

  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
  );

  const xml = await res.text();
  const entry = getFirstEntry(xml);

  if (!entry) return;

  const videoId = getXmlValue(entry, "yt:videoId");
  const title = getXmlValue(entry, "title");

  if (!videoId || !title) return;

  const lastVideoId = await getState("last_youtube_video_id");

  if (lastVideoId === videoId) return;

  await setState("last_youtube_video_id", videoId);

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
}

module.exports = {
  checkYouTubeUpload,
};
