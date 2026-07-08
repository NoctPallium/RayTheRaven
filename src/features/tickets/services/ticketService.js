const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const {
  getGuildSettings,
  createTicket: createTicketRecord,
  getOpenTicket,
  getTicketByChannel,
  closeTicket: closeTicketRecord,
} = require("../../../core/database/database");

// ==========================================
// Create Ticket
// ==========================================

async function createTicket(interaction) {
  const settings = await getGuildSettings(interaction.guild.id);

  if (!settings?.ticket_category_id || !settings?.staff_role_id) {
    return interaction.reply({
      content: "❌ Tickets haven't been configured yet. Run **/setup** first.",
      ephemeral: true,
    });
  }

  const type = interaction.values[0];

  // Prevent duplicate tickets
  const existing = await getOpenTicket(
    interaction.guild.id,
    interaction.user.id,
  );

  if (existing) {
    const existingChannel = interaction.guild.channels.cache.get(
      existing.channel_id,
    );

    if (existingChannel) {
      return interaction.reply({
        content: `❌ You already have an open ticket: ${existingChannel}`,
        ephemeral: true,
      });
    }
  }

  const channel = await interaction.guild.channels.create({
    name: `${type}-${interaction.user.username}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, ""),

    type: ChannelType.GuildText,

    parent: settings.ticket_category_id,

    permissionOverwrites: [
      {
        id: interaction.guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: settings.staff_role_id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageMessages,
        ],
      },
      {
        id: interaction.client.user.id,
        allow: [PermissionFlagsBits.Administrator],
      },
    ],
  });

  const embed = new EmbedBuilder()
    .setColor("#7C3AED")
    .setTitle(`🎫 ${type.charAt(0).toUpperCase() + type.slice(1)} Ticket`)
    .setDescription(
      [
        `Welcome ${interaction.user}!`,
        "",
        "Thank you for contacting **The Perch**.",
        "",
        "Please describe your issue in as much detail as possible.",
        "",
        "A member of staff has been notified and will assist you shortly.",
      ].join("\n"),
    )
    .addFields(
      {
        name: "📂 Ticket Type",
        value: type.charAt(0).toUpperCase() + type.slice(1),
        inline: true,
      },
      {
        name: "👤 Created By",
        value: `${interaction.user}`,
        inline: true,
      },
    )
    .setTimestamp()
    .setFooter({
      text: "Ray Ticket System",
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_close")
      .setLabel("Close Ticket")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger),
  );

  await channel.send({
    content: `<@&${settings.staff_role_id}> ${interaction.user}`,
    embeds: [embed],
    components: [row],
  });
  await createTicketRecord({
    channel_id: channel.id,
    guild_id: interaction.guild.id,
    creator_id: interaction.user.id,
    ticket_type: type,
    created_at: Date.now(),
  });
  await interaction.reply({
    content: `✅ Your ticket has been created: ${channel}`,
    ephemeral: true,
  });
}

// ==========================================
// Close Ticket
// ==========================================

async function closeTicket(interaction) {
  const settings = await getGuildSettings(interaction.guild.id);

  // ==========================================
  // Permission Check
  // ==========================================

  const isStaff = interaction.member.roles.cache.has(settings.staff_role_id);

  const isAdmin = interaction.member.permissions.has(
    PermissionFlagsBits.Administrator,
  );

  const ticket = await getTicketByChannel(interaction.channel.id);

  const isCreator = ticket && ticket.creator_id === interaction.user.id;

  if (!isCreator && !isStaff && !isAdmin) {
    return interaction.reply({
      content: "❌ Only the ticket creator or staff can close this ticket.",
      ephemeral: true,
    });
  }

  await interaction.deferReply();
  const disabledRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_close")
      .setLabel("Closing...")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
  );

  await interaction.message.edit({
    components: [disabledRow],
  });

  // ==========================================
  // Log Embed
  // ==========================================

  const embed = new EmbedBuilder()
    .setColor("#7C3AED")
    .setTitle("📄 Ticket Closed")
    .addFields(
      {
        name: "📂 Ticket",
        value: interaction.channel.name,
        inline: true,
      },
      {
        name: "👤 Closed By",
        value: interaction.user.tag,
        inline: true,
      },
    )
    .setTimestamp();

  const logChannel = interaction.guild.channels.cache.get(
    settings.log_channel_id,
  );

  if (logChannel) {
    await logChannel.send({
      embeds: [embed],
    });
  }
  await closeTicketRecord(interaction.channel.id);
  await interaction.editReply({
    content: "🔒 Ticket closed. Deleting channel in **5 seconds**...",
  });

  setTimeout(async () => {
    try {
      await interaction.channel.delete();
    } catch (err) {
      console.error(err);
    }
  }, 5000);
}

module.exports = {
  createTicket,
  closeTicket,
};
