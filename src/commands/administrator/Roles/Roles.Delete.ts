import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  Role,
  ColorResolvable,
  Guild,
  APIRole,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";

export default class RolesDelete extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "roles.delete",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const role = interaction.options.getRole("role", true) as Role;
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
      if ("delete" in role) {
        await role.delete(reason);
      } else {
        throw new Error("Role deletion is not supported on this object.");
      }

      const successEmbed = new EmbedBuilder()
        .setColor("#FF0000") // Red color for deletion
        .setTitle("✅ Role Deleted Successfully")
        .setDescription(`Role **${role.name}** has been deleted.`)
        .setFooter({ text: reason });

      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      await interaction.reply({
        content: `❌ | Failed to delete role: ${
          error instanceof Error ? error.message : String(error)
        }`,
        ephemeral: true,
      });
    }
  }
}
