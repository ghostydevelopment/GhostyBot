import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  TextChannel,
  PermissionsBitField,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import GuildConfig from "../../../base/schemas/GuildConfig";

export default class KickMass extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "kick.mass",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.member) {
      return interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
    }

    const targets =
      interaction.options
        .getString("targets")
        ?.split(",")
        .map((t) => t.trim()) || [];
    const reason =
      interaction.options.getString("reason") ?? "No reason provided";
    const silent = interaction.options.getBoolean("silent") ?? false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (targets.length === 0) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ | No users specified.")],
        ephemeral: true,
      });
    }

    const kickPromises = targets.map(async (targetId) => {
      const target = await interaction.guild?.members
        .fetch(targetId)
        .catch(() => null);
      if (!target) {
        return errorEmbed.setDescription(
          `❌ | User with ID ${targetId} not found.`
        );
      }

      if (target.id === interaction.user.id) {
        return errorEmbed.setDescription("❌ | You cannot kick yourself.");
      }

      if (
        !(interaction.member.permissions as PermissionsBitField).has(
          PermissionsBitField.Flags.KickMembers
        )
      ) {
        return errorEmbed.setDescription(
          "❌ | You don't have permission to kick members."
        );
      }

      if (
        target.roles.highest.position >=
        (interaction.member as GuildMember).roles.highest.position
      ) {
        return errorEmbed.setDescription(
          "❌ | You cannot kick a user with equal or higher rank."
        );
      }

      if (!target.kickable) {
        return errorEmbed.setDescription(
          `❌ | I cannot kick ${target.user.tag}.`
        );
      }

      // Attempt to DM the user before kicking
      try {
        await target.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription(
                `
                🔨 | You were kicked from **${interaction.guild?.name}** by ${interaction.user}
                Reason: ${reason}
                If you would like to appeal, please contact the server moderators.
              `
              )
              .setImage(interaction.guild?.iconURL() ?? null),
          ],
        });
      } catch (dmError) {
        console.log(`Failed to DM user ${target.id} before kick: ${dmError}`);
      }

      // Proceed with the kick
      try {
        await interaction.guild?.members.kick(target.id, reason);
        return `🔨 | ${target.user.tag} - \`${target.id}\` has been kicked.`;
      } catch (kickError) {
        return `❌ | There was an error kicking ${target.user.tag}: ${kickError}`;
      }
    });

    const results = await Promise.all(kickPromises);
    const successMessages = results.filter(
      (res) => typeof res === "string" && res.startsWith("🔨")
    );
    const errorMessages = results.filter(
      (res) => typeof res === "string" && res.startsWith("❌")
    );

    const responseEmbed = new EmbedBuilder()
      .setColor("Red")
      .setDescription([...successMessages, ...errorMessages].join("\n"));

    await interaction.reply({
      embeds: [responseEmbed],
      ephemeral: true,
    });

    if (!silent) {
      const channel = interaction.channel;
      if (channel && "send" in channel) {
        await channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setAuthor({ name: `🔨 | Mass Kick` })
              .setDescription(
                `
                **Kicked Users:** 
                ${successMessages.join("\n")}
                ${
                  errorMessages.length > 0
                    ? `**Errors:**\n${errorMessages.join("\n")}`
                    : ""
                }
              `
              )
              .setTimestamp(),
          ],
        });
      }

      const guild = await GuildConfig.findOne({
        guildId: interaction.guildId,
      });

      if (guild?.logs.moderation?.enabled && guild.logs.moderation.channelId) {
        const logChannel = (await interaction.guild?.channels.fetch(
          guild.logs.moderation.channelId
        )) as TextChannel;
        if (logChannel) {
          await logChannel.send({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setAuthor({ name: `🔨 | Mass Kick` })
                .setDescription(
                  `
                  **Kicked Users:** 
                  ${successMessages.join("\n")}
                  ${
                    errorMessages.length > 0
                      ? `**Errors:**\n${errorMessages.join("\n")}`
                      : ""
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
