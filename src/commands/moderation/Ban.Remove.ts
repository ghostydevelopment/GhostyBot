import {
  ChatInputCommandInteraction,
  Embed,
  EmbedBuilder,
  escapeHeading,
  GuildMember,
  GuildMemberRoleManager,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/Subcommand";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class BanRemove extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "ban.remove",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getString("target");
    const reason =
      interaction.options.getString("reason") ?? "No reason provided";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (reason.length > 512) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ | The reason cannot be longer than 512 characters."
          ),
        ],
        ephemeral: true,
      });
    }

    try {
      await interaction.guild?.bans.fetch(target!);
    } catch (error) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ | This user is not banned.`)],
      });
    }

    try {
      await interaction.guild?.bans.remove(target!);
    } catch (error) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | An error happened while trying to ban this user, please try again.`
          ),
        ],
      });
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(`🔨 | ${target} has been unbanned.`),
      ],
      ephemeral: true,
    });

    if (!silent) {
      const channel = interaction.channel;
      if (channel && "send" in channel) {
        channel
          .send({
            embeds: [
              new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: `🔨 | Unbanned - ${target}` })
                .setDescription(`
                  **Reason:** ${reason}
              `),
            ],
          })
          .then(async (msg) => await msg.react("🔨"));

        const guild = await GuildConfig.findOne({
          guildId: interaction.guildId,
        });

        if (
          guild &&
          guild.logs.moderation?.enabled &&
          guild.logs.moderation.channelId
        )
          (
            (await interaction.guild?.channels.fetch(
              guild.logs.moderation.channelId
            )) as TextChannel
          )?.send({
            embeds: [
              new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: `🔨 | Unbanned` })
                .setDescription(
                  `
                  **User:** ${target}
                  **Reason:** \`${reason}\``
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
