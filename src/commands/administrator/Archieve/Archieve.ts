import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Archieve extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "archieve",
      description: "Manage archieve for channels in the server",
      category: Category.Administrator,
      default_member_permissions: PermissionFlagsBits.Administrator,
      options: [
        {
          name: "add",
          description: "Add a channel to the archieve",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "target",
              description: "The channel to add to the archieve",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
            {
              name: "reason",
              description: "The reason for adding the channel to the archieve",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "silent",
              description: "Whether to silently add the channel to the archieve",
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
