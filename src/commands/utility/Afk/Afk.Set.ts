import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  Message,
  PermissionFlagsBits,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import UserAFKS from "../../../base/schemas/UserAFKS";

export default class AfkSet extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "afk.set",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;

    // Check if the user has the required permissions
    if (!member.permissions.has(PermissionFlagsBits.SendMessages)) {
      throw new Error("You do not have permission to set AFK status.");
    }

    const reason = interaction.options.getString("reason") || "AFK";

    // Set AFK status
    await UserAFKS.create({
      userId: member.id,
      guildId: interaction.guildId,
      reason,
      timestamp: Date.now(),
    });

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setDescription(
        `<a:animatedcheck:1299178944481984522> You are now AFK: ${reason}`
      )
      .setFooter({
        text: "I'll notify others when they mention you.",
      });

    await interaction.reply({ embeds: [embed], ephemeral: true });

    // Add a listener for message creation to check for mentions and remove AFK status
    const messageHandler = async (message: Message) => {
      if (message.author.id === member.id) {
        // Remove AFK status
        await UserAFKS.findOneAndDelete({
          userId: member.id,
          guildId: interaction.guildId,
        });

        const returnEmbed = new EmbedBuilder()
          .setColor("Green")
          .setDescription(
            `Welcome back, ${member.user.username}! Your AFK status has been removed.`
          );

        await message.reply({ embeds: [returnEmbed] });

        // Remove the listener
        this.client.off("messageCreate", messageHandler);
      } else if (message.mentions.members?.has(member.id)) {
        const afkEmbed = new EmbedBuilder()
          .setColor("Yellow")
          .setDescription(
            `<:caution2:1299182360436146297> ${member.user.username} is currently AFK: ${reason}`
          );

        await message.reply({ embeds: [afkEmbed] });
      }
    };

    this.client.on("messageCreate", messageHandler);
  }
}
