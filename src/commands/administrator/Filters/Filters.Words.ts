import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import Filters from "../../../base/schemas/Filters";

export default class FiltersWords extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "filters.words",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const enable = interaction.options.getBoolean("enable", true);

    const filterSetting = await Filters.findOneAndUpdate(
      { guildId: interaction.guildId },
      { words: enable },
      { new: true, upsert: true }
    );

    const embed = new EmbedBuilder()
      .setColor(enable ? "Green" : "Red")
      .setDescription(
        `Word filtering has been **${
          enable ? "enabled" : "disabled"
        }** for this server.`
      );

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
}
