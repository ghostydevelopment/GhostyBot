import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ChannelType,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import Backups from "../../../base/schemas/Backups";

export default class BackupStart extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "backup.start",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const backupId = interaction.options.getString("backup_id");

    const errorEmbed = new EmbedBuilder().setColor("Red");

    try {
      const backup = await Backups.findOne({ backupId });
      if (!backup) {
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription("❌ | Backup not found."),
          ],
          ephemeral: true,
        });
      }

      const guild = interaction.guild;
      if (!guild) {
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription("❌ | Guild not found."),
          ],
          ephemeral: true,
        });
      }

      // Delete all roles, channels, and categories that are not managed by a bot
      await Promise.all(guild.roles.cache.filter(role => !role.managed).map(role => role.delete().catch(() => {})));
      await Promise.all(guild.channels.cache.map(channel => channel.delete().catch(() => {})));

           // Restore roles
      for (const roleName of backup.roles) {
        await guild.roles.create({ name: roleName }).catch(() => {});
      }

      // Restore categories
      for (const categoryName of backup.categories) {
        await guild.channels.create({ name: categoryName, type: ChannelType.GuildCategory }).catch(() => {});
      }

      // Restore channels
      for (const channelName of backup.channels) {
        await guild.channels.create({ name: channelName, type: ChannelType.GuildText }).catch(() => {});
      }

      const successEmbed = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`✅ | Backup has been started successfully with ID: ${backupId}.`);

      await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error: any) {
      interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | Failed to start backup: ${error.message}`
          ),
        ],
        ephemeral: true,
      }).catch(() => {});
    }
  }
}