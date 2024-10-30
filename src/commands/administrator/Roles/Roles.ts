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
      default_member_permissions: PermissionFlagsBits.Administrator,
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
        {
          name: "create",
          description: "Create a new role",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "name",
              description: "The name of the role to create",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "color",
              description: "The color of the role",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "reason",
              description: "The reason for creating the role",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "permissions",
              description: "Permissions for the role",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
          ],
        },
        {
          name: "delete",
          description: "Delete an existing role",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "role",
              description: "The role to delete",
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
            {
              name: "reason",
              description: "The reason for deleting the role",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
          ],
        },
        {
          name: "all",
          description: "Add or remove all roles from all users",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "action",
              description: "Whether to add or remove all roles",
              type: ApplicationCommandOptionType.String,
              required: true,
              choices: [
                { name: "Add", value: "add" },
                { name: "Remove", value: "remove" },
              ],
            },
            {
              name: "role",
              description: "The role to add or remove",
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
            {
              name: "reason",
              description: "The reason for modifying all roles",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "silent",
              description: "Whether to silently modify all roles",
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
