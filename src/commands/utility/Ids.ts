import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandUserOption,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Ids extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "id",
      description: "Get the ID of a specified user",
      category: Category.Utilities,
      default_member_permissions: PermissionFlagsBits.UseApplicationCommands,
      options: [
        new SlashCommandUserOption()
          .setName("user")
          .setDescription("The user to get the ID of")
          .setRequired(true),
      ],
      cooldown: 5,
      dev: false,
      dm_permission: true,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user");

    if (!user) {
      return interaction.reply({
        content: "Please specify a valid user.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("User ID")
      .setDescription(
        `<:spaceship1:1299180094140715089> The ID of ${user.tag} is: \`${user.id}\``
      );

    interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
}
