import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ChannelType,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import Backups from "../../../base/schemas/Backups";
import { v4 as uuidv4 } from 'uuid';

export default class BackupAdd extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "backup.add",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const enabled = interaction.options.getBoolean("enabled");

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (!enabled) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription("❌ | Backup is not enabled."),
        ],
        ephemeral: true,
      });
    }

    try {
      const guild = interaction.guild;
      if (!guild) {
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription("❌ | Guild not found."),
          ],
          ephemeral: true,
        });
      }

      const channels = guild.channels.cache.map(channel => channel.name);
      const roles = guild.roles.cache
        .filter(role => !role.managed) // Filter out managed roles (usually bots)
        .map(role => role.name);
      const categories = guild.channels.cache
        .filter(channel => channel.type === ChannelType.GuildCategory)
        .map(category => category.name);

      const backupId = uuidv4();

      await Backups.create({
        backupId,
        guildId: guild.id,
        channels,
        roles,
        categories,
      });

      console.log(`Backup ID: ${backupId}`);

      const successEmbed = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`✅ | Backup has been added successfully.`);

      await interaction.reply({ embeds: [successEmbed], ephemeral: true });

      // DM the user with the backupId in a spoiler
      const user = interaction.user;
      await user.send(`Here is your backup ID: ||${backupId}||`);
    } catch (error: any) {
      interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | Failed to add backup: ${error.message}`
          ),
        ],
        ephemeral: true,
      });
    }
  }
}