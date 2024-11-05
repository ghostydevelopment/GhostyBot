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

export default class Invites extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "invites",
      description: "Get the total invites of a user",
      category: Category.Utilities,
      default_member_permissions: PermissionFlagsBits.UseApplicationCommands,
      options: [
        {
          name: "user",
          description: "The user to check invites for",
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
        content: "⚠️ Unable to find the specified user in this server.",
        ephemeral: true,
      });
    }

    try {
      const invites = await interaction.guild?.invites.fetch();
      let totalInvites =
        invites?.reduce((acc, invite) => {
          return invite.inviter?.id === targetUser.id
            ? acc + (invite.uses || 0)
            : acc;
        }, 0) || 0;

      const embed = new EmbedBuilder()
        .setColor("#3498db") // A more visually appealing blue
        .setTitle(
          `<:spaceship1:1299180094140715089> Invites for ${targetUser.tag}`
        )
        .setThumbnail(targetUser.displayAvatarURL({ size: 64 }))
        .setDescription(`**Total Invites:** ${totalInvites}`)
        .setFooter({ text: "Invite tracking is important!" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching invites:", error);
      await interaction.reply({
        content:
          "❌ An error occurred while fetching invites. Please try again later.",
        ephemeral: true,
      });
    }
  }
}
