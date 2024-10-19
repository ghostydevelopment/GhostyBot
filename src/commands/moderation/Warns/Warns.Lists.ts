import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  User,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import UserWarns from "../../../base/schemas/UserWarns";

export default class WarnsList extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "warns.list",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember(
      "target"
    ) as GuildMember | null;
    const user = target?.user || interaction.user;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    try {
      const userWarns = await UserWarns.findOne({
        userId: user.id,
        guildId: interaction.guildId,
      });

      if (!userWarns || userWarns.warns.length === 0) {
        return interaction.reply({
          embeds: [errorEmbed.setDescription(`❌ | ${user} has no warnings.`)],
          ephemeral: true,
        });
      }

      const warnsEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setAuthor({
          name: `Warnings for ${user.tag}`,
          iconURL: user.displayAvatarURL({ size: 64 }),
        })
        .setDescription(
          userWarns.warns
            .map(
              (warn, index) => `
              **Warning ${index + 1}**
              **ID:** ${warn.warnId}
              **Reason:** ${warn.reason}
              **Moderator:** <@${warn.moderatorId}>
              **Date:** ${warn.timestamp.toLocaleString()}
              `
            )
            .join("\n")
        )
        .setFooter({ text: `Total Warnings: ${userWarns.warns.length}` })
        .setTimestamp();

      await interaction.reply({
        embeds: [warnsEmbed],
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | An error occurred while fetching the warnings. Please contact the bot developer.`
          ),
        ],
        ephemeral: true,
      });
    }
  }
}
