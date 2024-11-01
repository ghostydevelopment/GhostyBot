import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
  } from "discord.js";
  import Command from "../../base/classes/Command";
  import CustomClient from "../../base/classes/CustomClient";
  import Category from "../../base/enums/Category";
  import ms from "ms";
  import os from "os";
  
  export default class Userlookup extends Command {
    constructor(client: CustomClient) {
      super(client, {
        name: "userlookup",
        description: "Get detailed information about a user",
        category: Category.Utilities,
        default_member_permissions: PermissionFlagsBits.UseApplicationCommands,
        options: [
          {
            name: "user",
            type: 6, // USER type
            description: "The user to look up",
            required: true,
          },
        ],
        cooldown: 5,
        dev: false,
        dm_permission: true,
      });
    }
  
    async Execute(interaction: ChatInputCommandInteraction) {
      const user = interaction.options.getUser("user");
      if (!user) {
        return interaction.reply({
          content: "User not found.",
          ephemeral: true,
        });
      }
  
      const member = await interaction.guild?.members.fetch(user.id);
  
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setThumbnail(user.displayAvatarURL())
            .setColor("Blue").setDescription(`
              __**User Info:**__
              > **Username:** \`${user.tag}\`
              > **ID:** \`${user.id}\`
              > **Created:** <t:${(user.createdTimestamp / 1000).toFixed(0)}:R>
              ${member ? `> **Joined:** <t:${(member.joinedTimestamp! / 1000).toFixed(0)}:R>` : ""}
              > **Bot:** \`${user.bot}\`
              `),
        ],
        ephemeral: true,
      });
    }
  }