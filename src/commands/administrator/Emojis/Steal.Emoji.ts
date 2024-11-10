import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";

export default class StealEmoji extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "steal.emoji",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const emojiInput = interaction.options.getString("emoji", true);
      const emojiName = interaction.options.getString("name", true);
      const emojiRegex = /<(a?):\w+:(\d+)>/;
      const match = emojiInput.match(emojiRegex);

      if (!match) {
        await interaction.editReply({
          content: "Invalid emoji format. Please provide a valid emoji.",
        });
        return;
      }

      const isAnimated = match[1] === 'a';
      const emojiId = match[2];
      const emojiURL = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;

      const newEmoji = await interaction.guild?.emojis.create({
        attachment: emojiURL,
        name: emojiName,
      });

      if (newEmoji) {
        await interaction.editReply({
          content: `Successfully added the emoji ${newEmoji} to this server!`,
        });
      } else {
        await interaction.editReply({
          content: "Failed to add the emoji to this server.",
        });
      }
    } catch (error) {
      await interaction.editReply({
        content: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }
}
