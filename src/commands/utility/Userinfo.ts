import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class UserInfo extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "userinfo",
      description: "Get information about a user.",
      category: Category.Utilities,
      default_member_permissions: PermissionFlagsBits.UseApplicationCommands,
      options: [
        {
          name: "target",
          description: "The user to get information about.",
          type: ApplicationCommandOptionType.User,
          required: false,
        },
      ],
      cooldown: 3,
      dev: false,
      dm_permission: false,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const target = (interaction.options.getMember("target") ||
      interaction.member) as GuildMember;
    await interaction.deferReply({ ephemeral: true });

    const fetchedMember = await target.fetch();

    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(fetchedMember.user.accentColor || "#0099ff") // Default to a blue color
          .setAuthor({
            name: `${fetchedMember.user.tag}'s Profile`,
            iconURL: fetchedMember.displayAvatarURL({}),
          })
          .setThumbnail(fetchedMember.displayAvatarURL({ size: 128 }))
          .setDescription(
            `
                __**User Info:**__
                > **ID:** \`${fetchedMember.id}\`
                > **Bot:** \`${fetchedMember.user.bot ? "Yes" : "No"}\`
                > **Account Created:** 📆 <t:${(
                  fetchedMember.user.createdTimestamp / 1000
                ).toFixed(0)}:D>
                
                __**Member Info:**__
                > **Nickname:** ${
                  fetchedMember.nickname || fetchedMember.user.username
                }
                > **Roles: (${fetchedMember.roles.cache.size - 1}):** ${
              fetchedMember.roles.cache
                .map((r) => r)
                .join(", ")
                .replace("@everyone", "") || "None"
            }
                > **Admin:** \`${fetchedMember.permissions.has(
                  PermissionFlagsBits.Administrator
                )}\`
                > **Joined Server:** 📆 <t:${(
                  fetchedMember.joinedTimestamp! / 1000
                ).toFixed(0)}:D>
                > **Joined Position:** \`#${
                  this.GetJoinPosition(interaction, fetchedMember)! + 1
                } / #${interaction.guild?.memberCount}\`
                > **Status:** \`${fetchedMember.presence?.status || "offline"}\`
                > **Current Activity:** \`${
                  fetchedMember.presence?.activities[0]?.name || "None"
                }\`
                `
          )
          .setFooter({
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp(),
      ],
    });
  }

  GetJoinPosition(
    interaction: ChatInputCommandInteraction,
    target: GuildMember
  ) {
    let pos = null;
    const joinPosition = interaction.guild?.members.cache.sort(
      (a, b) => a.joinedTimestamp! - b.joinedTimestamp!
    )!;
    Array.from(joinPosition).find((member, index) => {
      if (member[0] == target.user.id) pos = index;
    });
    return pos;
  }
}
