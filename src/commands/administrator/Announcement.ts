import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  TextChannel,
  NewsChannel, // Added to handle news channels
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Announcement extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "announcement",
      description: "Send a custom announcement to a specified channel",
      category: Category.Administrator,
      default_member_permissions: PermissionFlagsBits.Administrator,
      dm_permission: false,
      options: [
        {
          name: "channel",
          description: "The channel to send the announcement to",
          type: ApplicationCommandOptionType.Channel,
          required: true,
        },
        {
          name: "message",
          description: "The message to announce",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "urgency",
          description: "The urgency of the announcement",
          type: ApplicationCommandOptionType.String,
          required: false,
          choices: [
            {
              name: "None",
              value: "none",
            },
            {
              name: "High",
              value: "high",
            },
          ],
        },
      ],
      dev: false,
      cooldown: 3,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const targetChannel = interaction.options.getChannel("channel") as
      | TextChannel
      | NewsChannel; // Updated to include NewsChannel
    const message = interaction.options.getString("message", true);
    const urgency = interaction.options.getString("urgency") || "none";

    const embed = new EmbedBuilder()
      .setColor(urgency === "high" ? "#ff0000" : "#00ff00")
      .setTitle(
        urgency === "high"
          ? "🚨 **High Urgency Announcement** 🚨"
          : "📢 **Announcement** 📢"
      )
      .setDescription(`>>> ${message}`)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        {
          name: "**Urgency**",
          value: `\`${urgency.charAt(0).toUpperCase() + urgency.slice(1)}\``,
          inline: true,
        },
        { name: "**Channel**", value: `#${targetChannel.name}`, inline: true }
      )
      .setFooter({
        text: `Announced by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    if (
      targetChannel instanceof TextChannel ||
      targetChannel instanceof NewsChannel
    ) {
      await targetChannel.send({ embeds: [embed] });
    } else {
      await interaction.editReply({
        content:
          "❌ Invalid channel type. Please select a text or news channel.",
      });
      return;
    }

    await interaction.editReply({
      content: "✅ Announcement sent successfully!",
    });
  }
}
