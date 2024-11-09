import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  GuildMemberRoleManager,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class Kick extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "kick",
      description: "Kick a user from the server",
      category: Category.Moderation,
      default_member_permissions: PermissionFlagsBits.KickMembers,
      dm_permission: false,
      cooldown: 3,
      dev: false,
      options: [
        {
          name: "target",
          description: "The user to kick",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "reason",
          description: "The reason for kicking the user",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "silent",
          description: "Don't log it.",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
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
        embeds: [
          errorEmbed.setDescription("❌ | Please provide a valid user."),
        ],
        ephemeral: true,
      });

    if (target.id === interaction.user.id)
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ | You cannot kick yourself.")],
        ephemeral: true,
      });

    if (
      target.roles.highest.position >=
      (interaction.member?.roles as GuildMemberRoleManager).highest.position
    )
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ | You cannot kick a user with equal or higher roles."
          ),
        ],
        ephemeral: true,
      });

    if (!target.kickable)
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ | This user is not kickable.")],
        ephemeral: true,
      });

    if (reason.length > 512)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ | This reason cannot be longer than 512 characters."
          ),
        ],
        ephemeral: true,
      });

    try {
      await target.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Orange")
            .setDescription(
              `
            🥾 | You were kicked from **${interaction.guild?.name}** by ${interaction.member}
            If you would like to appeal, please contact the responsible moderator.
            
            **Reason:** ${reason}
            `
            )
            .setThumbnail(interaction.guild?.iconURL({ size: 4096 }) ?? null),
        ],
      });
    } catch (error) {
      // Do nothing
    }

    try {
      await target.kick(reason);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(`✅ | Successfully kicked ${target.user.tag}`),
        ],
        ephemeral: true,
      });
    } catch (error) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | An error occurred while trying to kick this user, please try again!`
          ),
        ],
        ephemeral: true,
      });
    }

    if (!silent) {
      await (interaction.channel as TextChannel)
        .send({
          embeds: [
            new EmbedBuilder()
              .setColor("Orange")
              .setAuthor({ name: `🥾 | Kicked ${target.user.tag}` })
              .setDescription(
                `
        **Reason:** ${reason}
        `
              )
              .setTimestamp()
              .setFooter({ text: `ID ${target.id}` }),
          ],
        })
        .then(async (x) => await x.react("🥾"));

      const guild = await GuildConfig.findOne({
        guildId: interaction.guildId,
      });

      if (
        guild?.logs?.moderation?.enabled &&
        guild?.logs?.moderation?.channelId
      ) {
        const logChannel = await interaction.guild?.channels.fetch(
          guild.logs.moderation.channelId
        );
        if (logChannel && logChannel.isTextBased()) {
          await logChannel.send({
            embeds: [
              new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: `🥾 | Kicked ${target.user.tag}` })
                .setDescription(
                  `
                **User:** ${target.user}
                **Moderator:** ${interaction.member}
                **Reason:** ${reason}
                
                `
                )
                .setTimestamp()
                .setFooter({
                  text: `Action taken by ${interaction.user.tag} | ${interaction.user.id}`,
                }),
            ],
          });
        }
      }
    }
  }
}
