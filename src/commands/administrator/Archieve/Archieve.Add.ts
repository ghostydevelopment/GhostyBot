import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildChannel,
  CategoryChannel,
  TextChannel,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import GuildConfig from "../../../base/schemas/GuildConfig";

export default class ArchiveAdd extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "archive.add",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getChannel("target") as GuildChannel;
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (!target) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ | Please provide a valid channel to archive"
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
      // Rename the channel
      await target.setName(`Archived-${target.name}`, reason);

      // Edit channel permissions to prevent everyone from sending messages
      const everyoneRole = guild.roles.everyone;
      await target.permissionOverwrites.edit(everyoneRole, {
        SendMessages: false,
      });

      // Find or create the "Archived" category
      let archiveCategory = guild.channels.cache.find(
        (channel) =>
          channel.type === ChannelType.GuildCategory && channel.name === "Archived"
      ) as CategoryChannel;

      if (!archiveCategory) {
        archiveCategory = (await guild.channels.create({
          name: "Archived",
          type: ChannelType.GuildCategory,
          reason,
        })) as CategoryChannel;
      }

      // Move the channel to the "Archived" category
      await target.setParent(archiveCategory.id, { reason });

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(`✅ | Archived channel ${target.name}`),
        ],
      });

      if (!silent) {
        const channel = interaction.channel;
        if (channel && "send" in channel) {
          await channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: "✅ | Channel Archived" })
                .setDescription(
                  `
                  **Channel:** ${target.name}
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
                    .setAuthor({ name: "✅ | Channel Archived" })
                    .setDescription(
                      `
                      **Channel:** ${target.name}
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
            `❌ | An error occurred while archiving the channel: ${error}`
          ),
        ],
      });
    }
  }
}