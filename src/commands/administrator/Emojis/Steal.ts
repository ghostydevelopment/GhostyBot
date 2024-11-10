import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Steal extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "steal",
      description: "Steal emojis from other servers",
      category: Category.Administrator,
      default_member_permissions: PermissionFlagsBits.ManageEmojisAndStickers,
      options: [
        {
          name: "emoji",
          description: "Steal a single emoji",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "emoji",
              description: "The emoji to steal",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "name",
              description: "The name for the stolen emoji",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
        {
          name: "multiple",
          description: "Steal multiple emojis",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "emojis",
              description: "The emojis to steal, separated by spaces",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "name",
              description: "The base name for the stolen emojis",
              type: ApplicationCommandOptionType.String,
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
