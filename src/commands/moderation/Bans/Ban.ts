import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Ban extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "ban",
      description: "Ban a user from the server or remove a ban.",
      category: Category.Moderation,
      default_member_permissions: PermissionFlagsBits.BanMembers,
      dm_permission: false,
      cooldown: 3,
      dev: false,
      options: [
        {
          name: "add",
          description: "Bans a user from the server.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "Select the user to ban.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "reason",
              description: "Provide a reason for the ban.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "days",
              description: "Deletes the users recent messages.",
              type: ApplicationCommandOptionType.String,
              required: false,
              choices: [
                { name: "None", value: "0" },
                { name: "Previous 1 day", value: "1d" },
                { name: "Previous 3 days", value: "3d" },
                { name: "Previous 7 days", value: "7d" },
              ],
            },
            {
              name: "silent",
              description: "Silent ban the user.",
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
          ],
        },
        {
          name: "remove",
          description: "remove a user.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "Select the user to remove the ban from.",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "reason",
              description: "Provide a reason for the ban.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "silent",
              description: "Silent ban the user.",
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
          ],
        },
        {
          name: "soft",
          description: "Soft ban a user from the server.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "Select the user to soft ban.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "reason",
              description: "Provide a reason for the soft ban.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "silent",
              description: "Silent soft ban the user.",
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
          ],
        },
        {
          name: "all",
          description: "List all banned users in the current guild.",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "mass",
          description: "Ban multiple users from the server.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "targets",
              description: "Select the users to ban.",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "reason",
              description: "Provide a reason for the ban.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "days",
              description: "Deletes the users recent messages.",
              type: ApplicationCommandOptionType.String,
              required: false,
              choices: [
                { name: "None", value: "0" },
                { name: "Previous 1 day", value: "1d" },
                { name: "Previous 3 days", value: "3d" },
                { name: "Previous 7 days", value: "7d" },
              ],
            },
            {
              name: "silent",
              description: "Silent ban the users.",
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
          ],
        },
      ],
    });
  }
}
