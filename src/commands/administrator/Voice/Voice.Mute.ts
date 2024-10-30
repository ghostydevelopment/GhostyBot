import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";

export default class VoiceMute extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "voice.mute",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;
    const mute = interaction.options.getBoolean("mute") as boolean;
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

    if (mute && target.voice.serverMute) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ | User is already muted.")],
        ephemeral: true,
      });
    }

    if (!mute && !target.voice.serverMute) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ | User is not muted.")],
        ephemeral: true,
      });
    }

    try {
      await target.voice.setMute(mute, reason);
      const successEmbed = new EmbedBuilder()
        .setColor("Green")
        .setDescription(
          `✅ | ${mute ? "Muted" : "Unmuted"} ${target.user.tag} for: ${reason}`
        );

      await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error: any) {
      interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | Failed to ${mute ? "mute" : "unmute"} user: ${error.message}`
          ),
        ],
        ephemeral: true,
      });
    }
  }
}
