import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  TextChannel,
  PermissionsBitField,
} from "discord.js";
import ms from "ms";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import GuildConfig from "../../../base/schemas/GuildConfig";

export default class BanMass extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "ban.mass",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.member) {
      return interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
    }

    const targets = interaction.options.getString("targets");
    const reason =
      interaction.options.getString("reason") ?? "No reason provided";
    const days = interaction.options.getString("days") ?? "0";
    const silent = interaction.options.getBoolean("silent") ?? false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (!targets) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription("❌ | No users specified.")],
        ephemeral: true,
      });
    }

    const targetIds = targets.split(",").map(id => id.trim());
    const failedBans: string[] = [];

    for (const targetId of targetIds) {
      const target = await interaction.guild?.members.fetch(targetId).catch(() => null);

      if (!target) {
        failedBans.push(targetId);
        continue;
      }

      if (target.id === interaction.user.id) {
        failedBans.push(targetId);
        continue;
      }

      if (
        !(interaction.member.permissions as PermissionsBitField).has(
          PermissionsBitField.Flags.BanMembers
        )
      ) {
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(
              "❌ | You don't have permission to ban members."
            ),
          ],
          ephemeral: true,
        });
      }

      if (
        target.roles.highest.position >=
        (interaction.member as GuildMember).roles.highest.position
      ) {
        failedBans.push(targetId);
        continue;
      }

      if (!target.bannable) {
        failedBans.push(targetId);
        continue;
      }

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

      // Attempt to DM the user before banning
      try {
        await target.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription(
                `
                🔨 | You were banned from **${interaction.guild?.name}** by ${interaction.user}
                Reason: ${reason}
                If you would like to appeal, please contact the server moderators.
              `
              )
              .setImage(interaction.guild?.iconURL() ?? null),
          ],
        });
      } catch (dmError) {
        console.log(`Failed to DM user ${target.id} before ban: ${dmError}`);
      }

      // Proceed with the ban
      try {
        await interaction.guild?.members.ban(target, {
          deleteMessageSeconds: ms(days) / 1000,
          reason: reason,
        });
      } catch (banError) {
        failedBans.push(targetId);
        continue;
      }
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setDescription(
            `🔨 | Banned users: ${targetIds.filter((id: string) => !failedBans.includes(id)).join(", ")}\n` +
            (failedBans.length > 0 ? `❌ | Failed to ban: ${failedBans.join(", ")}` : "")
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
                .setColor("Red")
                .setAuthor({ name: `🔨 | Mass Ban` })
                .setDescription(
                  `
                  **Reason:** ${reason}
                  ${
                    days !== "0"
                      ? `Messages from the last \`${days}\` have been deleted.`
                      : ""
                  }    
                `
                )
                .setTimestamp(),
            ],
          })
          .then(async (msg) => await msg.react("🔨"));

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
                  .setColor("Red")
                  .setAuthor({ name: `🔨 | Mass Ban` })
                  .setDescription(
                    `
                    **Reason:** \`${reason}\`
                    ${
                      days !== "0"
                        ? `Messages from the last \`${days}\` have been deleted.`
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
}