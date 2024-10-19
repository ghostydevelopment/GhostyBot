import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Notes extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "notes",
      description: "Manage notes for users in the server",
      category: Category.Moderation,
      default_member_permissions: PermissionFlagsBits.ManageMessages,
      options: [
        {
          name: "add",
          description: "Add a note to a user",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The user to add a note to",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "note",
              description: "The note to add",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "silent",
              description: "Whether to add the note silently",
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
          ],
        },
        {
          name: "remove",
          description: "Remove a note from a user",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The user to remove a note from",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "note_id",
              description: "The ID of the note to remove",
              type: ApplicationCommandOptionType.Integer,
              required: true,
            },
            {
              name: "silent",
              description: "Whether to remove the note silently",
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
          ],
        },
        {
          name: "list",
          description: "List notes for a user",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The user to list notes for",
              type: ApplicationCommandOptionType.User,
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
