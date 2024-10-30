import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";

export default class VoiceKick extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "voice.kick",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;
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

    try {
      await target.voice.disconnect(reason);
      const successEmbed = new EmbedBuilder()
        .setColor("Green")
        .setDescription(
          `✅ | Kicked ${target.user.tag} from the voice channel for: ${reason}`
        );

      await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error: any) {
      interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | Failed to kick user: ${error.message}`
          ),
        ],
        ephemeral: true,
      });
    }
  }
}
