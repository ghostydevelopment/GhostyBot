import {
  ApplicationCommandOptionType,
  AuditLogEvent,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
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
          name: "limit",
          description:
            "Number of audit log entries to show (default: 10, max: 25)",
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
    const limit = Math.min(interaction.options.getInteger("limit") || 10, 25);

    if (!interaction.guild) {
      return interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
    }

    try {
      const auditLogs = await interaction.guild.fetchAuditLogs({ limit });

      const embed = new EmbedBuilder()
        .setColor("#4B0082")
        .setTitle(`🔍 Audit Log Overview`)
        .setDescription(
          `Here are the last ${limit} audit log entries for ${interaction.guild.name}.`
        )
        .addFields(
          auditLogs.entries.map((entry) => {
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

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      await interaction.reply({
        content: "An error occurred while fetching the audit logs.",
        ephemeral: true,
      });
    }
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
