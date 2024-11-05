import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Kick extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "kick",
      description: "Kick a user from the server.",
      category: Category.Moderation,
      default_member_permissions: PermissionFlagsBits.KickMembers,
      dm_permission: false,
      cooldown: 3,
      dev: false,
      options: [
        {
          name: "add",
          description: "Kicks a user from the server.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "Select the user to kick.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "reason",
              description: "Provide a reason for the kick.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "silent",
              description: "Silent kick the user.",
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
          ],
        },
        {
          name: "mass",
          description: "Kick multiple users from the server.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "targets",
              description: "Select the users to kick.",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "reason",
              description: "Provide a reason for the kick.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "silent",
              description: "Silent kick the users.",
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
          ],
        },
      ],
    });
  }
}
