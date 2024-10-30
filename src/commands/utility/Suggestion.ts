import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import Suggestions from "../../base/schemas/Suggestions";

export default class Suggestion extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "suggest",
      description: "Submit a suggestion",
      category: Category.Utilities,
      default_member_permissions: PermissionFlagsBits.UseApplicationCommands,
      options: [
        {
          name: "content",
          description: "The content of your suggestion",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
      cooldown: 5,
      dev: false,
      dm_permission: false,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const content = interaction.options.getString("content");

    await interaction.deferReply({ ephemeral: true });

    try {
      const suggestionData = await Suggestions.findOne({
        guildId: interaction.guildId,
      });

      if (!suggestionData || !suggestionData.channelId) {
        return interaction.editReply({
          content: "Suggestions are not set up for this server.",
        });
      }

      if (!interaction.guild) {
        return interaction.editReply({
          content: "This command can only be used in a server.",
        });
      }

      const suggestionChannel = await interaction.guild.channels.fetch(
        suggestionData.channelId
      );

      if (!suggestionChannel || !suggestionChannel.isTextBased()) {
        return interaction.editReply({
          content: "The suggestion channel is not properly configured.",
        });
      }

      const suggestionId = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle(`Suggestion #${suggestionId}`)
        .setDescription(content)
        .setTimestamp();

      const message = await suggestionChannel.send({ embeds: [embed] });

      await Suggestions.findOneAndUpdate(
        { guildId: interaction.guildId },
        {
          $set: {
            userId: interaction.user.id,
            content: content,
            suggestionId: suggestionId,
            messageId: message.id,
          },
        },
        { upsert: true }
      );

      return interaction.editReply({
        content: `Your suggestion has been submitted with ID: ${suggestionId}`,
      });
    } catch (error) {
      console.error(error);
      return interaction.editReply({
        content:
          "There was an error while submitting your suggestion. Please try again later.",
      });
    }
  }
}
