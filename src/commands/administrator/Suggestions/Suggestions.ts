import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Suggestions extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "suggestions",
      description: "Configure the suggestions for your server.",
      category: Category.Administrator,
      default_member_permissions: PermissionFlagsBits.Administrator,
      dm_permission: false,
      dev: false,
      cooldown: 3,
      options: [
        {
          name: "set",
          description: "Set the suggestions channel for your server.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "Channel where suggestions will be sent to.",
              type: ApplicationCommandOptionType.Channel,
              required: true,
              channel_types: [ChannelType.GuildText],
            },
          ],
        },
      ],
    });
  }
}
