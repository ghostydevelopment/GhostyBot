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

export default class RolesAll extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "roles.all",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const role = interaction.options.getRole("role") as Role;
    const action = interaction.options.getString("action") as "add" | "remove";
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (!role)
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ | Please provide a valid role`)],
        ephemeral: true,
      });

    if (!["add", "remove"].includes(action))
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ | Invalid action specified`)],
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

    const guild = interaction.guild;
    if (!guild)
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ | Unable to fetch guild`)],
        ephemeral: true,
      });

    const highestBotRole = guild.members.me?.roles.highest;
    const highestMemberRole = (
      interaction.member?.roles as GuildMemberRoleManager
    ).highest;

    if (!highestBotRole || !highestMemberRole)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(`❌ | Unable to determine role hierarchy`),
        ],
        ephemeral: true,
      });

    if (
      role.position >= highestBotRole.position ||
      role.position >= highestMemberRole.position
    )
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | You don't have permission to ${action} this role`
          ),
        ],
        ephemeral: true,
      });

    await interaction.deferReply({ ephemeral: true });

    let successCount = 0;
    let failCount = 0;

    try {
      const members = await guild.members.fetch();
      for (const [memberId, member] of members) {
        if (action === "add" && !member.roles.cache.has(role.id)) {
          try {
            await member.roles.add(role, reason);
            successCount++;
          } catch (error) {
            failCount++;
          }
        } else if (action === "remove" && member.roles.cache.has(role.id)) {
          try {
            await member.roles.remove(role, reason);
            successCount++;
          } catch (error) {
            failCount++;
          }
        }
      }
    } catch (error) {
      return interaction.editReply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | An error occurred while modifying roles: ${error}`
          ),
        ],
      });
    }

    const successEmbed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(
        `✅ | Successfully ${
          action === "add" ? "added" : "removed"
        } ${role} to/from ${successCount} member(s). Failed for ${failCount} member(s).`
      );

    await interaction.editReply({ embeds: [successEmbed] });

    if (!silent) {
      const channel = interaction.channel;
      if (channel && "send" in channel) {
        await channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setAuthor({
                name: `✅ | Role ${
                  action === "add" ? "Added" : "Removed"
                } Server-wide`,
              })
              .setDescription(
                `
                **Action:** ${
                  action === "add" ? "Added" : "Removed"
                } role server-wide
                **Role:** ${role}
                **Successful:** ${successCount}
                **Failed:** ${failCount}
                **Reason:** ${reason}
                `
              )
              .setTimestamp(),
          ],
        });

        const guildConfig = await GuildConfig.findOne({
          guildId: interaction.guildId,
        });

        if (
          guildConfig?.logs.moderation?.enabled &&
          guildConfig.logs.moderation.channelId
        ) {
          const logChannel = (await interaction.guild?.channels.fetch(
            guildConfig.logs.moderation.channelId
          )) as TextChannel;
          if (logChannel) {
            await logChannel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor("Green")
                  .setAuthor({
                    name: `✅ | Role ${
                      action === "add" ? "Added" : "Removed"
                    } Server-wide`,
                  })
                  .setDescription(
                    `
                    **Action:** ${
                      action === "add" ? "Added" : "Removed"
                    } role server-wide
                    **Role:** ${role}
                    **Successful:** ${successCount}
                    **Failed:** ${failCount}
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
