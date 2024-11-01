import {
    ApplicationCommandOptionType,
    PermissionFlagsBits,
  } from "discord.js";
  import Command from "../../../base/classes/Command";
  import CustomClient from "../../../base/classes/CustomClient";
  import Category from "../../../base/enums/Category";
  
  export default class Send extends Command {
    constructor(client: CustomClient) {
      super(client, {
        name: "send",
        description: "Send a message via DM or view message history.",
        category: Category.Administrator,
        default_member_permissions: PermissionFlagsBits.Administrator,
        dm_permission: false,
        dev: false,
        cooldown: 5,
        options: [
          {
            name: "dm",
            description: "Send a direct message to a user.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "user",
                description: "The user to send a direct message to.",
                type: ApplicationCommandOptionType.User,
                required: true,
              },
              {
                name: "message",
                description: "The message to send.",
                type: ApplicationCommandOptionType.String,
                required: true,
              },
            ],
          },
          {
            name: "history",
            description: "View the message history of a user.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "user",
                description: "The user to view message history of.",
                type: ApplicationCommandOptionType.User,
                required: true,
              },
              {
                name: "channel",
                description: "The channel to view message history in.",
                type: ApplicationCommandOptionType.Channel,
                required: true,
              },
            ],
          },
        ],
      });
    }
  }