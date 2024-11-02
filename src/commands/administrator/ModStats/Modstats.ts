import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class ModStats extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "modstats",
      description: "Shows how many actions a moderator has taken",
      category: Category.Administrator,
      default_member_permissions: PermissionFlagsBits.Administrator,
      options: [
        {
          name: "view",
          description: "View moderator stats",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "user",
              description: "Select the user",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
          ],
        },
      ],
      dev: false,
      dm_permission: false,
      cooldown: 3,
    });
  }
}
