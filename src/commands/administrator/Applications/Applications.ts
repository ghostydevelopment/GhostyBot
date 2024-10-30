import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Applications extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "applications",
      description: "Manage applications in the server",
      category: Category.Administrator,
      default_member_permissions: PermissionFlagsBits.ManageGuild,
      options: [
        {
          name: "add",
          description: "Add a new application",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "open",
              description: "Set the application to be open or closed",
              type: ApplicationCommandOptionType.Boolean,
              required: true,
              choices: [
                {
                  name: "open",
                  value: true,
                },
                {
                  name: "closed",
                  value: false,
                },
              ],
            },
            {
              name: "channel",
              description:
                "Specify the channel for applications to be logged to.",
              type: ApplicationCommandOptionType.Channel,
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
