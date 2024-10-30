import {
    ChatInputCommandInteraction,
    EmbedBuilder,
  } from "discord.js";
  import CustomClient from "../../../base/classes/CustomClient";
  import SubCommand from "../../../base/classes/Subcommand";
  import Backups from "../../../base/schemas/Backups";
  
  export default class BackupCheck extends SubCommand {
    constructor(client: CustomClient) {
      super(client, {
        name: "backup.check",
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
  
        const statusEmbed = new EmbedBuilder()
          .setColor("Green")
          .setDescription(`✅ | Backup found with ID: ${backupId}.`);
  
        await interaction.reply({ embeds: [statusEmbed], ephemeral: true });
      } catch (error: any) {
        interaction.reply({
          embeds: [
            errorEmbed.setDescription(
              `❌ | Failed to check backup: ${error.message}`
            ),
          ],
          ephemeral: true,
        });
      }
    }
  }