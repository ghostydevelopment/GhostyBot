import { ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";

export default class TestC extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "testing",
      description: "Testing",
      category: Category.Utilities,
      default_member_permissions: PermissionFlagsBits.UseApplicationCommands,
      dm_permission: false,
      cooldown: 3,
      options: [],
      dev: false,
    });
  }

  Execute(interaction: ChatInputCommandInteraction) {
    interaction.reply({ content: "This command works.", ephemeral: true });
  }
}
