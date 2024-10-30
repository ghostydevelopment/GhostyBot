import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Lockdown extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "lockdown",
      description: "Initiate or lift a lockdown on the entire server.",
      category: Category.Administrator,
      default_member_permissions: PermissionFlagsBits.Administrator,
      dm_permission: false,
      dev: false,
      cooldown: 5,
      options: [
        {
          name: "add",
          description: "Initiate a lockdown on the entire server.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "reason",
              description: "The reason for initiating the lockdown.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "silent",
              description:
                "Initiate the lockdown without sending a notification.",
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
          ],
        },
        {
          name: "remove",
          description: "Lift a lockdown from the entire server.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "reason",
              description: "The reason for lifting the lockdown.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "silent",
              description: "Lift the lockdown without sending a notification.",
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
          ],
        },
      ],
    });
  }
}
