import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import Filters from "../../../base/schemas/Filters"; // Use Filters schema

export default class FiltersLinks extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "filters.links",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const enable = interaction.options.getBoolean("enable", true);

    const filterSetting = await Filters.findOneAndUpdate(
      { guildId: interaction.guildId },
      { links: enable }, // Update the 'links' field instead of 'enable'
      { new: true, upsert: true }
    );

    const embed = new EmbedBuilder()
      .setColor(enable ? "Green" : "Red")
      .setDescription(
        `Link filtering has been **${
          enable ? "enabled" : "disabled"
        }** for this server.`
      );

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
}
