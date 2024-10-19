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

export default class WarnsAdd extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "warns.add",
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
        embeds: [errorEmbed.setDescription(`❌ | You cannot warn yourself`)],
        ephemeral: true,
      });

    if (
      target.roles.highest.position >=
      (interaction.member?.roles as GuildMemberRoleManager).highest.position
    )
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | You cannot warn a user with equal or higher roles.`
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

    const warnId = Math.random().toString(36).substring(2, 14);
    const newWarn = {
      warnId,
      userId: target.id,
      guildId: interaction.guildId!,
      moderatorId: interaction.user.id,
      reason,
      timestamp: new Date(),
    };

    try {
      await UserWarns.findOneAndUpdate(
        { userId: target.id, guildId: interaction.guildId },
        { $push: { warns: newWarn } },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(error);
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | An error occurred while adding the warn. Please contact the bot developer.`
          ),
        ],
        ephemeral: true,
      });
    }

    try {
      await target.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Yellow")
            .setDescription(
              `
              ⚠️ | You have been warned in **${interaction.guild?.name}** by **${interaction.user}**
              If you'd like to appeal this warning, please contact the responsible moderator.

              **Reason:** ${reason}
              **Warn ID:** ${warnId}
              `
            )
            .setThumbnail(interaction.guild?.iconURL() || null),
        ],
      });
    } catch {
      // Do nothing if DM fails
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Yellow")
          .setDescription(
            `⚠️ | Warned ${target} - ${target.id}\n**Reason:** ${reason}\n**Warn ID:** ${warnId}`
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
                .setColor("Yellow")
                .setAuthor({ name: `⚠️ | Warning - ${target.user.tag}` })
                .setThumbnail(target.displayAvatarURL({ size: 64 }))
                .setDescription(
                  `
                  **Reason:** ${reason}
                  **Warn ID:** ${warnId}
                `
                )
                .setTimestamp(),
            ],
          })
          .then(async (msg) => await msg.react("⚠️"));

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
                  .setColor("Yellow")
                  .setThumbnail(target.displayAvatarURL({ size: 64 }))
                  .setAuthor({ name: `⚠️ | Warning` })
                  .setDescription(
                    `
                    **User:** ${target} (${target.id})
                    **Reason:** ${reason}
                    **Warn ID:** ${warnId}
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
