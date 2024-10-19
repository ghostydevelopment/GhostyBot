import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Roles extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "roles",
      description: "Manage roles for users in the server",
      category: Category.Moderation,
      default_member_permissions: PermissionFlagsBits.ManageRoles,
      options: [
        {
          name: "add",
          description: "Add a role to a user",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The user to add the role to",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "role",
              description: "The role to add",
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
            {
              name: "reason",
              description: "The reason for adding the role",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "silent",
              description: "Whether to silently add the role",
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
          ],
        },
        {
          name: "remove",
          description: "Remove a role from a user",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The user to remove the role from",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "role",
              description: "The role to remove",
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
            {
              name: "reason",
              description: "The reason for removing the role",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "silent",
              description: "Whether to silently remove the role",
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
