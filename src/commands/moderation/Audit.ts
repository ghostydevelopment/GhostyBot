import {
  ApplicationCommandOptionType,
  AuditLogEvent,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  GuildAuditLogsEntry,
  ButtonInteraction,
  TextChannel,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Audit extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "audit",
      description: "Show recent entries from the server's audit log",
      category: Category.Moderation,
      default_member_permissions: PermissionFlagsBits.ViewAuditLog,
      options: [
        {
          name: "page",
          description: "Page number to show (default: 1)",
          type: ApplicationCommandOptionType.Integer,
          required: false,
        },
      ],
      cooldown: 10,
      dm_permission: false,
      dev: false,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const page = Math.max(interaction.options.getInteger("page") || 1, 1);
    const limit = 10; // Fixed limit of 10 entries per page

    if (!interaction.guild) {
      return interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
    }

    try {
      const auditLogs = await interaction.guild.fetchAuditLogs({ limit: 100 }); // Fetch more logs to paginate
      const entries = auditLogs.entries
        .toJSON()
        .slice((page - 1) * limit, page * limit) as GuildAuditLogsEntry[];

      const embed = new EmbedBuilder()
        .setColor("#4B0082")
        .setTitle(`🔍 Audit Log Overview - Page ${page}`)
        .setDescription(
          `Here are the audit log entries for ${interaction.guild.name}.`
        )
        .addFields(
          entries.map((entry) => {
            const action = AuditLogEvent[entry.action];
            const timestamp = Math.floor(entry.createdTimestamp / 1000);
            return {
              name: `${this.getEmojiForAction(action)} ${action}`,
              value: `**Executor:** ${entry.executor}\n**Target:** ${
                entry.target
              }\n**Reason:** ${
                entry.reason || "No reason provided"
              }\n**When:** <t:${timestamp}:F> (<t:${timestamp}:R>)`,
              inline: false,
            };
          })
        )
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      // Create buttons for pagination
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 1), // Disable if on the first page
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(entries.length < limit) // Disable if there are no more entries
      );

      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });

      // Handle button interactions
      const filter = (i: ButtonInteraction) =>
        i.user.id === interaction.user.id;
      if (
        interaction.channel &&
        "createMessageComponentCollector" in interaction.channel
      ) {
        const collector = (
          interaction.channel as TextChannel
        ).createMessageComponentCollector({
          filter: (i) => i.isButton() && i.user.id === interaction.user.id,
          time: 60000,
        });

        collector.on("collect", async (i: ButtonInteraction) => {
          await i.deferUpdate();
          if (i.customId === "prev" && page > 1) {
            await this.sendPage(interaction, page - 1);
          } else if (i.customId === "next") {
            await this.sendPage(interaction, page + 1);
          }
        });

        collector.on("end", async () => {
          // Disable buttons after the collector ends
          const disabledRow =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId("prev")
                .setLabel("Previous")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId("next")
                .setLabel("Next")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
            );
          await interaction.editReply({ components: [disabledRow] });
        });
      } else {
        console.error(
          "Channel is null or does not support message component collectors."
        );
        return;
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      await interaction.reply({
        content: "An error occurred while fetching the audit logs.",
        ephemeral: true,
      });
    }
  }

  private async sendPage(
    interaction: ChatInputCommandInteraction,
    page: number
  ) {
    const limit = 10; // Fixed limit of 10 entries per page
    if (!interaction.guild) {
      throw new Error("Guild not found.");
    }
    const auditLogs = await interaction.guild.fetchAuditLogs({ limit: 100 });
    const entries = auditLogs.entries
      .toJSON()
      .slice((page - 1) * limit, page * limit) as GuildAuditLogsEntry[];

    const embed = new EmbedBuilder()
      .setColor("#4B0082")
      .setTitle(`🔍 Audit Log Overview - Page ${page}`)
      .setDescription(
        `Here are the audit log entries for ${
          interaction.guild?.name || "this server"
        }.`
      )
      .addFields(
        entries.map((entry) => {
          const action = AuditLogEvent[entry.action];
          const timestamp = Math.floor(entry.createdTimestamp / 1000);
          return {
            name: `${this.getEmojiForAction(action)} ${action}`,
            value: `**Executor:** ${entry.executor}\n**Target:** ${
              entry.target
            }\n**Reason:** ${
              entry.reason || "No reason provided"
            }\n**When:** <t:${timestamp}:F> (<t:${timestamp}:R>)`,
            inline: false,
          };
        })
      )
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  private getEmojiForAction(action: string): string {
    const emojiMap: { [key: string]: string } = {
      MEMBER_KICK: "👢",
      MEMBER_BAN_ADD: "🔨",
      MEMBER_BAN_REMOVE: "🔓",
      MEMBER_UPDATE: "📝",
      MEMBER_ROLE_UPDATE: "🎭",
      CHANNEL_CREATE: "➕",
      CHANNEL_DELETE: "➖",
      CHANNEL_UPDATE: "🔧",
      ROLE_CREATE: "🆕",
      ROLE_DELETE: "🗑️",
      ROLE_UPDATE: "✏️",
      MESSAGE_DELETE: "🗑️",
      MESSAGE_BULK_DELETE: "🧹",
      // Add more mappings as needed
    };

    return emojiMap[action] || "📋";
  }
}
