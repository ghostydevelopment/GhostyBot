import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Backup extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "backup",
      description: "Manage server backups.",
      category: Category.Administrator,
      default_member_permissions: PermissionFlagsBits.Administrator,
      dm_permission: false,
      dev: false,
      cooldown: 3,
      options: [
        {
          name: "add",
          description: "Add a backup.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "enabled",
              description: "Enable or disable the backup.",
              type: ApplicationCommandOptionType.Boolean,
              required: true,
            },
          ],
        },
        {
          name: "remove",
          description: "Remove a backup.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "backup_id",
              description: "The ID of the backup to remove.",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
        {
          name: "check",
          description: "Check the status of a backup.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "backup_id",
              description: "The ID of the backup to check.",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
        {
          name: "start",
          description: "Start a backup process.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "backup_id",
              description: "The ID of the backup to start.",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
      ],
    });
  }
}
