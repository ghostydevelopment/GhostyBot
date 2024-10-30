import {
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import Filters from "../../../base/schemas/Filters";

export default class FiltersSet extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "filters.set",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    const links = interaction.options.getBoolean("links");
    const words = interaction.options.getBoolean("words");
    const nicknames = interaction.options.getBoolean("nicknames");
    const raid = interaction.options.getBoolean("raid");

    const errorEmbed = new EmbedBuilder().setColor("Red");

    try {
      const filterSettings = await Filters.findOneAndUpdate(
        { guildId },
        { links, words, nicknames, raid },
        { new: true, upsert: true }
      );

      const successEmbed = new EmbedBuilder()
        .setColor("Green")
        .setDescription(
          `✅ | Filter settings updated: Links: ${filterSettings.links}, Words: ${filterSettings.words}, Nicknames: ${filterSettings.nicknames}, Raid: ${filterSettings.raid}`
        );

      await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error: any) {
      interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | Failed to update filter settings: ${error.message}`
          ),
        ],
        ephemeral: true,
      });
    }
  }
}