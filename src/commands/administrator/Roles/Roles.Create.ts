import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  Role,
  ColorResolvable,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";

export default class RolesCreate extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "roles.create",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const roleName = interaction.options.getString("name", true);
    const roleColor = interaction.options.getString("color") || "#FFFFFF"; // Default to white if no color is provided
    const reason =
      interaction.options.getString("reason") || "No specific reason provided";

    const guild = interaction.guild;
    if (!guild) {
      return interaction.reply({
        content: "❌ | Unable to fetch guild",
        ephemeral: true,
      });
    }

    try {
      const newRole = await guild.roles.create({
        name: roleName,
        color: roleColor as ColorResolvable,
        reason: reason,
      });

      const successEmbed = new EmbedBuilder()
        .setColor(newRole.color as ColorResolvable)
        .setTitle("✅ Role Created Successfully")
        .setDescription(
          `Role **${newRole.name}** has been created with ID: ${newRole.id}`
        )
        .setFooter({ text: reason });

      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      await interaction.reply({
        content: `❌ | Failed to create role: ${
          error instanceof Error ? error.message : String(error)
        }`,
        ephemeral: true,
      });
    }
  }
}
