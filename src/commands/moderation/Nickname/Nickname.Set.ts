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

export default class NicknameSet extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "nickname.set",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;
    const newNickname = interaction.options.getString("nickname")!;
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
            `❌ | You cannot change your own nickname using this command`
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
            `❌ | You cannot change the nickname of a user with equal or higher roles.`
          ),
        ],
        ephemeral: true,
      });

    if (newNickname.length > 32)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | Nickname must be 32 or fewer characters in length`
          ),
        ],
        ephemeral: true,
      });

    try {
      await target.setNickname(newNickname, reason);
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
          .setDescription(
            `✅ | Changed nickname of ${target} (${target.id}) to "${newNickname}"`
          ),
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
              .setAuthor({ name: `📝 | Nickname Changed - ${target.user.tag}` })
              .setThumbnail(target.displayAvatarURL({ size: 64 }))
              .setDescription(
                `
                **User:** ${target} (${target.id})
                **New Nickname:** ${newNickname}
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
                  .setAuthor({ name: `📝 | Nickname Changed` })
                  .setDescription(
                    `
                    **User:** ${target} (${target.id})
                    **New Nickname:** ${newNickname}
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
