import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  GuildMemberRoleManager,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/Subcommand";
import ms from "ms";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class TimeoutRemove extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "timeout.remove",
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

    if (target.id == interaction.user.id)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | You cannot remove a timeout from yourself`
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
            `❌ | You cannot remove a timeout from a user with equal or higher roles.`
          ),
        ],
        ephemeral: true,
      });

    if (target.communicationDisabledUntil == null)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | ${target} isn't currently timed out!`
          ),
        ],
        ephemeral: true,
      });

    if (reason.length > 512)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | Reason must be less than 512 characters`
          ),
        ],
        ephemeral: true,
      });

    try {
      await target.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Blue")
            .setDescription(
              `
                    ⌛| Your timeout in **${interaction.guild?.name}** was removed by **${interaction.member}**
    
                    **Reason:** ${reason}
                    `
            )
            .setImage(interaction.guild?.iconURL()!),
        ],
      });
    } catch {
      // Do nothing
    }
    try {
      await target.timeout(null, reason);
    } catch {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | An error has occured, please contact Matty.`
          ),
        ],
        ephemeral: true,
      });
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Blue")
          .setDescription(
            `⌛ | remove timed out for ${target} - ${target.id}}`
          ),
      ],
      ephemeral: true,
    });

    if (!silent) {
      const channel = interaction.channel;
      if (channel && "send" in channel) {
        await channel
          .send({
            embeds: [
              new EmbedBuilder()
                .setColor("Blue")
                .setAuthor({
                  name: `⌛ | Timeout Removed - ${target.user.tag}`,
                })
                .setThumbnail(target.displayAvatarURL({ size: 64 }))
                .setDescription(
                  `
                      **Reason:** ${reason}
                    `
                )
                .setTimestamp(),
            ],
          })
          .then(async (msg) => await msg.react("⌛"));

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
                  .setAuthor({ name: `⌛ | Timeout Removed` })
                  .setDescription(
                    `
                    **User:** ${target} - \`${target.id}\`
                      **Reason:** ${reason}
                          }
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
