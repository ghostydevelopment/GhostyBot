import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Nickname extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "nickname",
      description: "Manage nicknames of users in the server",
      category: Category.Moderation,
      default_member_permissions: PermissionFlagsBits.ManageNicknames,
      options: [
        {
          name: "set",
          description: "Set a nickname for a user",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The user to set the nickname for",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "nickname",
              description: "The new nickname for the user",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "reason",
              description: "The reason for changing the nickname",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "silent",
              description: "Whether to send a message in the log channel",
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
          ],
        },
        {
          name: "remove",
          description: "Remove a user's nickname",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The user to remove the nickname from",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "reason",
              description: "The reason for removing the nickname",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "silent",
              description: "Whether to send a message in the log channel",
              type: ApplicationCommandOptionType.Boolean,
              required: false,
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
