import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Timeout extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "timeout",
      description: "Timeout a user in the server",
      category: Category.Moderation,
      default_member_permissions: PermissionFlagsBits.MuteMembers,
      options: [
        {
          name: "add",
          description: "Timeout a user in the server",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The user to timeout",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "length",
              description: "The length of the timeout",
              type: ApplicationCommandOptionType.String,
              required: false,
              choices: [
                { name: "5 Minutes", value: "5m" },
                { name: "10 Minutes", value: "10m" },
                { name: "15 Minutes", value: "15m" },
                { name: "30 Minutes", value: "30m" },
                { name: "1 Hour", value: "1h" },
                { name: "2 Hours", value: "2h" },
                { name: "4 Hours", value: "4h" },
                { name: "8 Hours", value: "8h" },
                { name: "12 Hours", value: "12h" },
                { name: "1 Day", value: "1d" },
                { name: "3 Days", value: "3d" },
                { name: "7 Days", value: "7d" },
                { name: "14 Days", value: "14d" },
                { name: "30 Days", value: "30d" },
              ],
            },
            {
              name: "reason",
              description: "The reason for the timeout",
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
          description: "Removes a timeout from a user",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "Select a user to untimeout",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "reason",
              description: "The reason for the untimeout",
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
