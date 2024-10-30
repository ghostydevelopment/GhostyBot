import {
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import Backups from "../../../base/schemas/Backups";

export default class BackupRemove extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "backup.remove",
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

      await Backups.deleteOne({ backupId });

      const successEmbed = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`✅ | Backup has been removed successfully.`);

      await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error: any) {
      interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | Failed to remove backup: ${error.message}`
          ),
        ],
        ephemeral: true,
      });
    }
  }
}