import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";

export default class StealMultipleEmojis extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "steal.multiple",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const emojisInput = interaction.options.getString("emojis", true);
      const namesInput = interaction.options.getString("name", true);
      const emojiRegex = /<(a?):\w+:(\d+)>/g;
      const matches = [...emojisInput.matchAll(emojiRegex)];
      const names = namesInput.split(" ");

      if (matches.length === 0 || matches.length !== names.length) {
        await interaction.editReply({
          content: "Invalid input. Ensure emojis and names are valid and match in number.",
        });
        return;
      }

      const addedEmojis = [];
      const failedEmojis = [];

      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const isAnimated = match[1] === 'a';
        const emojiId = match[2];
        const emojiURL = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;
        const emojiName = names[i];

        try {
          const newEmoji = await interaction.guild?.emojis.create({
            attachment: emojiURL,
            name: emojiName,
          });

          if (newEmoji) {
            addedEmojis.push(newEmoji.toString());
          } else {
            failedEmojis.push(emojiId);
          }
        } catch {
          failedEmojis.push(emojiId);
        }
      }

      let replyContent = "";
      if (addedEmojis.length > 0) {
        replyContent += `Successfully added the following emojis: ${addedEmojis.join(", ")}\n`;
      }
      if (failedEmojis.length > 0) {
        replyContent += `Failed to add the following emojis: ${failedEmojis.join(", ")}`;
      }

      await interaction.editReply({
        content: replyContent || "No emojis were added.",
      });
    } catch (error) {
      await interaction.editReply({
        content: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }
}
