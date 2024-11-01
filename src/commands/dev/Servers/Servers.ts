import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Servers extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "servers",
      description: "Manage servers",
      category: Category.Developer,
      default_member_permissions: PermissionFlagsBits.Administrator,
      options: [
        {
          name: "view",
          description: "View server information",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "leave",
          description: "Leave a server",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "server_id",
              description: "The ID of the server to leave",
              type: ApplicationCommandOptionType.String,
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
