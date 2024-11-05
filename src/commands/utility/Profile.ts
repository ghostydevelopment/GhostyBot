import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  GuildMember,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Profile extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "profile",
      description: "Get the profile of a user",
      category: Category.Utilities,
      default_member_permissions: PermissionFlagsBits.UseApplicationCommands,
      options: [
        {
          name: "user",
          description: "The user to check profile for",
          type: ApplicationCommandOptionType.User,
          required: false,
        },
      ],
      cooldown: 5,
      dev: false,
      dm_permission: false,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser("user") || interaction.user;
    const member = interaction.guild?.members.cache.get(targetUser.id);

    if (!member) {
      return interaction.reply({
        content: "Unable to find the specified user in this server.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#7289DA") // Discord blue
      .setTitle(`🌟 Profile of ${targetUser.tag} 🌟`)
      .setThumbnail(targetUser.displayAvatarURL({}))
      .addFields(
        {
          name: "👤 Username",
          value: `\`${targetUser.username}\``,
          inline: true,
        },
        {
          name: "#️⃣ Discriminator",
          value: `\`#${targetUser.discriminator}\``,
          inline: true,
        },
        { name: "🆔 ID", value: `\`${targetUser.id}\``, inline: true },
        {
          name: "📅 Joined Server",
          value: `<t:${Math.floor(member.joinedTimestamp! / 1000)}:R>`,
          inline: true,
        },
        {
          name: "📆 Account Created",
          value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: "🔰 Roles",
          value:
            member.roles.cache.size > 0
              ? member.roles.cache.map((role) => `\`${role.name}\``).join(", ")
              : "No roles",
          inline: false,
        },
        {
          name: "📡 Status",
          value: `\`${member.presence?.status || "offline"}\``,
          inline: true,
        },
        {
          name: "🎮 Activity",
          value: `\`${member.presence?.activities[0]?.name || "None"}\``,
          inline: true,
        },
        {
          name: "🏆 Highest Role",
          value: `\`${member.roles.highest.name}\``,
          inline: true,
        },
        {
          name: "🔗 Profile Link",
          value: `[Click Here](https://discord.com/users/${targetUser.id})`,
          inline: true,
        }
      )
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
