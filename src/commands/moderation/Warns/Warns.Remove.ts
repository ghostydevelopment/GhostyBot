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
import UserWarns from "../../../base/schemas/UserWarns";

export default class WarnsRemove extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "warns.remove",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;
    const warnId = interaction.options.getString("warn_id");
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (!target)
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ | Please provide a valid user`)],
        ephemeral: true,
      });

    if (
      target.roles.highest.position >=
      (interaction.member?.roles as GuildMemberRoleManager).highest.position
    )
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | You cannot remove a warning from a user with equal or higher roles.`
          ),
        ],
        ephemeral: true,
      });

    try {
      const userWarns = await UserWarns.findOne({
        userId: target.id,
        guildId: interaction.guildId,
      });

      if (!userWarns || userWarns.warns.length === 0) {
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(`❌ | This user has no warnings.`),
          ],
          ephemeral: true,
        });
      }

      const warnToRemove = userWarns.warns.find(
        (warn) => warn.warnId === warnId
      );

      if (!warnToRemove) {
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(
              `❌ | Warning with ID ${warnId} not found.`
            ),
          ],
          ephemeral: true,
        });
      }

      await UserWarns.updateOne(
        { userId: target.id, guildId: interaction.guildId },
        { $pull: { warns: { warnId: warnId } } }
      );

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(
              `✅ | Removed warning with ID ${warnId} from ${target} - ${target.id}\n**Reason:** ${reason}`
            ),
        ],
        ephemeral: true,
      });

      try {
        await target.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setDescription(
                `
                ✅ | A warning has been removed in **${interaction.guild?.name}** by **${interaction.user}**

                **Reason:** ${reason}
                **Removed Warn ID:** ${warnId}
                `
              )
              .setThumbnail(interaction.guild?.iconURL() || null),
          ],
        });
      } catch {
        // Do nothing if DM fails
      }

      if (!silent) {
        const channel = interaction.channel;
        if (channel && "send" in channel) {
          await channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor("Green")
                .setAuthor({
                  name: `✅ | Warning Removed - ${target.user.tag}`,
                })
                .setThumbnail(target.displayAvatarURL({ size: 64 }))
                .setDescription(
                  `
                  **Reason:** ${reason}
                  **Removed Warn ID:** ${warnId}
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
            )) as TextChannel | null;
            if (logChannel) {
              await logChannel.send({
                embeds: [
                  new EmbedBuilder()
                    .setColor("Green")
                    .setThumbnail(target.displayAvatarURL({ size: 64 }))
                    .setAuthor({ name: `✅ | Warning Removed` })
                    .setDescription(
                      `
                      **User:** ${target} (${target.id})
                      **Reason:** ${reason}
                      **Removed Warn ID:** ${warnId}
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
    } catch (error) {
      console.error(error);
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | An error occurred while removing the warning. Please contact the bot developer.`
          ),
        ],
        ephemeral: true,
      });
    }
  }
}
