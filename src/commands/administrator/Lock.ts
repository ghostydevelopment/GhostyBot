import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Lock extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "lock",
      description: "Lock or unlock a channel or the entire server.",
      category: Category.Administrator,
      default_member_permissions: PermissionFlagsBits.Administrator,
      dm_permission: false,
      dev: false,
      cooldown: 5,
      options: [
        {
          name: "add",
          description: "Lock a channel or the entire server.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description:
                "The channel to lock. If not specified, locks the entire server.",
              type: ApplicationCommandOptionType.Channel,
              required: false,
              channel_types: [
                ChannelType.GuildText,
                ChannelType.GuildVoice,
                ChannelType.GuildCategory,
              ],
            },
            {
              name: "reason",
              description: "The reason for locking the channel or server.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "silent",
              description: "Lock the channel without sending a notification.",
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
          ],
        },
        {
          name: "remove",
          description: "Unlock a channel or the entire server.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description:
                "The channel to unlock. If not specified, unlocks the entire server.",
              type: ApplicationCommandOptionType.Channel,
              required: false,
              channel_types: [
                ChannelType.GuildText,
                ChannelType.GuildVoice,
                ChannelType.GuildCategory,
              ],
            },
            {
              name: "reason",
              description: "The reason for unlocking the channel or server.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "silent",
              description: "Unlock the channel without sending a notification.",
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
          ],
        },
      ],
    });
  }
}
