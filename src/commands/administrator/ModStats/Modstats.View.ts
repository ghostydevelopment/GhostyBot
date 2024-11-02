import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  User,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import UserWarns from "../../../base/schemas/UserWarns";
import UserNotes from "../../../base/schemas/UserNotes";
import Filters from "../../../base/schemas/Filters";
import Backup from "../../../base/schemas/Backups";
import Applications from "../../../base/schemas/Applications";

export default class ModStatsView extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "modstats.view",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user");
    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (!user) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ | User not found`)],
        ephemeral: true,
      });
    }

    try {
      // Fetch moderator stats from the database
      const modStats = await this.getModStats(user);

      const statsEmbed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`📊 Moderator Stats for ${user.username}`)
        .setDescription(`Here are the stats for **${user.username}**`)
        .addFields(
          { name: "⚠️ Warnings Given", value: `\`${modStats.warnings}\``, inline: true },
          { name: "📝 Notes Taken", value: `\`${modStats.notes}\``, inline: true },
          { name: "🔍 Filter Setup", value: modStats.filterSetup ? "✅ Yes" : "❌ No", inline: true },
          { name: "💾 Backup Made", value: modStats.backupMade ? "✅ Yes" : "❌ No", inline: true },
          { name: "📋 Application Setup", value: modStats.applicationSetup ? "✅ Yes" : "❌ No", inline: true }
        )
        .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();

      interaction.reply({
        embeds: [statsEmbed],
        ephemeral: true,
      });
    } catch {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | An error has occurred, please contact Matty.`
          ),
        ],
        ephemeral: true,
      });
    }
  }

  // Function to fetch moderator stats from the database
  private async getModStats(user: User) {
    const warnings = await UserWarns.countDocuments({ moderatorId: user.id });
    const notes = await UserNotes.countDocuments({ moderatorId: user.id });
    const filterSetup = await Filters.exists({ userId: user.id });
    const backupMade = await Backup.exists({ userId: user.id });
    const applicationSetup = await Applications.exists({ userId: user.id });

    return {
      warnings,
      notes,
      filterSetup: !!filterSetup,
      backupMade: !!backupMade,
      applicationSetup: !!applicationSetup,
    };
  }
}