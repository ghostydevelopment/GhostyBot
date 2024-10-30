import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";

export default class VoiceDeafen extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "voice.deafen",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;
    const deafen = interaction.options.getBoolean("deafen") as boolean;
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (!target.voice.channel) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription("❌ | User is not in a voice channel."),
        ],
        ephemeral: true,
      });
    }

    if (deafen && target.voice.serverDeaf) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ | User is already deafened.")],
        ephemeral: true,
      });
    }

    if (!deafen && !target.voice.serverDeaf) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ | User is not deafened.")],
        ephemeral: true,
      });
    }

    try {
      await target.voice.setDeaf(deafen, reason);
      const successEmbed = new EmbedBuilder()
        .setColor("Green")
        .setDescription(
          `✅ | ${deafen ? "Deafened" : "Undeafened"} ${
            target.user.tag
          } for: ${reason}`
        );

      await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error: any) {
      interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | Failed to ${deafen ? "deafen" : "undeafen"} user: ${
              error.message
            }`
          ),
        ],
        ephemeral: true,
      });
    }
  }
}
