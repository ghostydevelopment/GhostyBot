import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  GuildMemberRoleManager,
  TextChannel,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import GuildConfig from "../../../base/schemas/GuildConfig";

export default class NicknameRemove extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "nickname.remove",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (!target)
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ | Please provide a valid user`)],
        ephemeral: true,
      });

    if (target.id === interaction.user.id)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | You cannot remove your own nickname using this command`
          ),
        ],
        ephemeral: true,
      });

    if (
      target.roles.highest.position >=
      (interaction.member?.roles as GuildMemberRoleManager).highest.position
    )
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | You cannot remove the nickname of a user with equal or higher roles.`
          ),
        ],
        ephemeral: true,
      });

    if (!target.nickname)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | This user doesn't have a nickname to remove.`
          ),
        ],
        ephemeral: true,
      });

    const oldNickname = target.nickname;

    try {
      await target.setNickname(null, reason);
    } catch {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | An error has occurred, please contact the bot owner.`
          ),
        ],
        ephemeral: true,
      });
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(`✅ | Removed nickname of ${target} (${target.id})`),
      ],
      ephemeral: true,
    });

    if (!silent) {
      const channel = interaction.channel;
      if (channel && "send" in channel) {
        await channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Blue")
              .setAuthor({ name: `📝 | Nickname Removed - ${target.user.tag}` })
              .setThumbnail(target.displayAvatarURL({ size: 64 }))
              .setDescription(
                `
                **User:** ${target} (${target.id})
                **Old Nickname:** ${oldNickname}
                **Reason:** ${reason}
                `
              )
              .setTimestamp(),
          ],
        });

        const guild = await GuildConfig.findOne({
          guildId: interaction.guildId,
        });

        if (
          guild?.logs.moderation?.enabled &&
          guild.logs.moderation.channelId
        ) {
          const logChannel = (await interaction.guild?.channels.fetch(
            guild.logs.moderation.channelId
          )) as TextChannel;
          if (logChannel) {
            await logChannel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor("Blue")
                  .setThumbnail(target.displayAvatarURL({ size: 64 }))
                  .setAuthor({ name: `📝 | Nickname Removed` })
                  .setDescription(
                    `
                    **User:** ${target} (${target.id})
                    **Old Nickname:** ${oldNickname}
                    **Reason:** ${reason}
                    `
                  )
                  .setTimestamp()
                  .setFooter({
                    text: `Actioned by ${interaction.user.tag} - ${interaction.user.id}`,
                    iconURL: interaction.user.displayAvatarURL({ size: 64 }),
                  }),
              ],
            });
          }
        }
      }
    }
  }
}
