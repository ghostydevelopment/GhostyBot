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
        .setColor("Blue")
        .setTitle(`Recent Audit Log Entries`)
        .setDescription(
          auditLogs.entries
            .map((entry) => {
              const action = AuditLogEvent[entry.action];
              return `**${action}** by ${entry.executor} - <t:${Math.floor(
                entry.createdTimestamp / 1000
              )}:R>`;
            })
            .join("\n")
        )
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
}
