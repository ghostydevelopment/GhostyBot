import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Afk extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "afk",
      description: "Set your AFK status",
      category: Category.Utilities,
      default_member_permissions: PermissionFlagsBits.SendMessages,
      options: [
        {
          name: "set",
          description: "Set your AFK status",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "reason",
              description: "The reason for going AFK",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
          ],
        },
      ],
      dev: false,
      dm_permission: false,
      cooldown: 5,
    });
  }
}
