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
    const role = interaction.options.getRole("role") as Role;
    const target = interaction.options.getMember("target") as GuildMember;
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (!role || !target) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ | Please provide a valid role and target member"
          ),
        ],
        ephemeral: true,
      });
    }

    if (
      role.position >=
      (interaction.member?.roles as GuildMemberRoleManager).highest.position
    ) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ | You cannot add a role that is equal to or higher than your highest role."
          ),
        ],
        ephemeral: true,
      });
    }

    if (reason.length > 512) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ | Reason must be less than 512 characters"
          ),
        ],
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    if (!guild) {
      return interaction.editReply({
        embeds: [
          errorEmbed.setDescription("❌ | Unable to fetch guild information."),
        ],
      });
    }

    try {
      if (target.roles.cache.has(role.id)) {
        return interaction.editReply({
          embeds: [
            errorEmbed.setDescription(
              `❌ | ${target.user.tag} already has the ${role.name} role.`
            ),
          ],
        });
      }

      await target.roles.add(role, reason);

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(`✅ | Added role ${role} to ${target.user.tag}`),
        ],
      });

      if (!silent) {
        const channel = interaction.channel;
        if (channel && "send" in channel) {
          await channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: "✅ | Role Added to Member" })
                .setDescription(
                  `
                  **Role:** ${role}
                  **Member:** ${target.user.tag}
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
                    .setAuthor({ name: "✅ | Role Added to Member" })
                    .setDescription(
                      `
                      **Role:** ${role}
                      **Member:** ${target.user.tag}
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
    } catch (error) {
      console.error(error);
      return interaction.editReply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | An error occurred while adding the role: ${error}`
          ),
        ],
      });
    }
  }
}
