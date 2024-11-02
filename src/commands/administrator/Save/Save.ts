import {
    ApplicationCommandOptionType,
    PermissionFlagsBits,
  } from "discord.js";
  import Command from "../../../base/classes/Command";
  import CustomClient from "../../../base/classes/CustomClient";
  import Category from "../../../base/enums/Category";
  
  export default class Save extends Command {
    constructor(client: CustomClient) {
      super(client, {
        name: "save",
        description: "Save a message for a user.",
        category: Category.Administrator,
        default_member_permissions: PermissionFlagsBits.Administrator,
        dm_permission: false,
        dev: false,
        cooldown: 5,
        options: [
          {
            name: "message",
            description: "Save a message for a user.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "user",
                description: "The user to save a message for.",
                type: ApplicationCommandOptionType.User,
                required: true,
              },
              {
                name: "channel",
                description: "The channel to save the message in.",
                type: ApplicationCommandOptionType.Channel,
                required: true,
              },
            ],
          },
        ],
      });
    }
  }