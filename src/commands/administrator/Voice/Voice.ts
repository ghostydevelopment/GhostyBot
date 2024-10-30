import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Voice extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "voice",
      description: "Manage voice state of users.",
      category: Category.Administrator,
      default_member_permissions: PermissionFlagsBits.Administrator,
      dm_permission: false,
      dev: false,
      cooldown: 3,
      options: [
        {
          name: "deafen",
          description: "Deafen a user in voice channels.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The user to deafen or undeafen.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "deafen",
              description: "Whether to deafen or undeafen the user.",
              type: ApplicationCommandOptionType.Boolean,
              required: true,
            },
            {
              name: "reason",
              description: "Reason for deafening the user.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
          ],
        },
        {
          name: "mute",
          description: "Mute a user in voice channels.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The user to mute or unmute.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "mute",
              description: "Whether to mute or unmute the user.",
              type: ApplicationCommandOptionType.Boolean,
              required: true,
            },
            {
              name: "reason",
              description: "Reason for muting the user.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
          ],
        },
        {
          name: "kick",
          description: "Kick a user from voice channels.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The user to kick from the voice channel.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "reason",
              description: "Reason for kicking the user.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
          ],
        },
      ],
    });
  }
}
