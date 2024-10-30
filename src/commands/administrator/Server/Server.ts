import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Server extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "server",
      description: "Manage server settings",
      category: Category.Administrator,
      default_member_permissions: PermissionFlagsBits.Administrator,
      options: [
        {
          name: "role",
          description: "Manage server roles",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "type",
              description: "Select the role type",
              type: ApplicationCommandOptionType.String,
              required: true,
              choices: [
                { name: "Dividers", value: "Dividers" },
                { name: "Level", value: "Level" },
                { name: "Dms", value: "Dms" },
                { name: "Sexuality", value: "Sexuality" },
                { name: "Region", value: "Region" },
                { name: "Nationality", value: "Nationality" },
              ],
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
