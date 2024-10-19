import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Warns extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "warns",
      description: "Manage warns for users in the server",
      category: Category.Moderation,
      default_member_permissions: PermissionFlagsBits.ModerateMembers,
      options: [
        {
          name: "add",
          description: "Add a warn to a user",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The user to warn",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "reason",
              description: "The reason for the warn",
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
          description: "Remove a warn from a user",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The user to remove a warn from",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "warn_id",
              description: "The ID of the warn to remove",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "reason",
              description: "The reason for removing the warn",
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
          name: "list",
          description: "List warns for a user",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The user to list warns for",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "silent",
              description: "Whether to send the list privately",
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
