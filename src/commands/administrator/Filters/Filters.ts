import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Filters extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "filters",
      description: "Manage message filters in the server",
      category: Category.Administrator,
      default_member_permissions: PermissionFlagsBits.ManageGuild,
      options: [
        {
          name: "set",
          description: "Set the filtering options",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "links",
              description: "Enable or disable link filtering",
              type: ApplicationCommandOptionType.Boolean,
              required: true,
            },
            {
              name: "words",
              description: "Enable or disable word filtering",
              type: ApplicationCommandOptionType.Boolean,
              required: true,
            },
            {
              name: "nicknames",
              description: "Enable or disable nickname filtering",
              type: ApplicationCommandOptionType.Boolean,
              required: true,
            },
            {
              name: "raid",
              description: "Enable or disable anti-raid protection",
              type: ApplicationCommandOptionType.Boolean,
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
