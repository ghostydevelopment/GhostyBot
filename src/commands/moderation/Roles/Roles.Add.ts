import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  GuildMemberRoleManager,
  Role,
  TextChannel,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import GuildConfig from "../../../base/schemas/GuildConfig";

export default class RolesAdd extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "roles.add",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;
    const role = interaction.options.getRole("role") as Role;
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (!target)
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ | Please provide a valid user`)],
        ephemeral: true,
      });

    if (!role)
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ | Please provide a valid role`)],
        ephemeral: true,
      });

    if (target.roles.cache.has(role.id))
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | ${target} already has the ${role} role`
          ),
        ],
        ephemeral: true,
      });

    if (
      role.position >=
      (interaction.member?.roles as GuildMemberRoleManager).highest.position
    )
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | You cannot add a role that is equal to or higher than your highest role.`
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
      await target.roles.add(role, reason);
    } catch {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | An error has occurred, please contact the bot developer.`
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
            `✅ | Added role ${role} to ${target} - ${target.id}`
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
              .setColor("Green")
              .setAuthor({ name: `✅ | Role Added - ${target.user.tag}` })
              .setThumbnail(target.displayAvatarURL({ size: 64 }))
              .setDescription(
                `
                **Role:** ${role}
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
                  .setColor("Green")
                  .setThumbnail(target.displayAvatarURL({ size: 64 }))
                  .setAuthor({ name: `✅ | Role Added` })
                  .setDescription(
                    `
                    **Member:** ${target} (${target.id})
                    **Role:** ${role}
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
