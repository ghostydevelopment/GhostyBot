import {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import Command from "../../../base/classes/Command";
import CustomClient from "../../../base/classes/CustomClient";
import Category from "../../../base/enums/Category";

export default class Tickets extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "tickets",
      description: "Configure the ticket system for your server.",
      category: Category.Administrator,
      default_member_permissions: PermissionFlagsBits.Administrator,
      dm_permission: false,
      dev: false,
      cooldown: 3,
      options: [
        {
          name: "setup",
          description: "Setup the ticket system for your server.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "category",
              description: "The category where tickets will be created.",
              type: ApplicationCommandOptionType.Channel,
              required: true,
              channel_types: [ChannelType.GuildCategory],
            },
            {
              name: "support-role",
              description: "The role that can see and manage tickets.",
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
            {
              name: "transcript-channel",
              description: "The channel where ticket transcripts will be sent.",
              type: ApplicationCommandOptionType.Channel,
              required: true,
              channel_types: [ChannelType.GuildText],
            },
            {
              name: "ticket-channel",
              description: "The channel where users can create tickets.",
              type: ApplicationCommandOptionType.Channel,
              required: true,
              channel_types: [ChannelType.GuildText],
            },
            {
              name: "welcome-message",
              description: "The message sent when a new ticket is created.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
          ],
        },
      ],
    });
  }
}
