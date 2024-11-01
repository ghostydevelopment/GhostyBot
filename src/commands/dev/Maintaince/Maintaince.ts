import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Maintaince extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "maintaince",
      description: "Manage maintaince mode",
      category: Category.Developer,
      default_member_permissions: PermissionFlagsBits.Administrator,
      options: [
        {
          name: "set",
          description: "Set maintaince mode",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "enabled",
              description: "Enable or disable maintaince mode",
              type: ApplicationCommandOptionType.Boolean,
              required: true,
            },
          ],
        },
      ],
      dev: true,
      dm_permission: false,
      cooldown: 3,
    });
  }
}
