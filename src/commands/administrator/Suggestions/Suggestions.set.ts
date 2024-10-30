import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import Suggestions from "../../../base/schemas/Suggestions";

export default class SuggestionsSet extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "suggestions.set",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel("channel") as TextChannel;

    await interaction.deferReply({ ephemeral: true });

    try {
      let suggestion = await Suggestions.findOne({
        guildId: interaction.guildId,
      });

      if (!suggestion) {
        suggestion = new Suggestions({
          guildId: interaction.guildId,
          userId: interaction.user.id,
          content: "",
          suggestionId: "",
          channelId: channel.id,
        });
      } else {
        suggestion.channelId = channel.id;
      }

      await suggestion.save();

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(`✅ Updated suggestions channel to ${channel}`),
        ],
      });
    } catch (error) {
      console.log(error);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              `❌ There was an error while updating the database. Please try again!`
            ),
        ],
      });
    }
  }
}
