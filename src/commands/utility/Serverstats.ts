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

export default class Serverstats extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "serverstats",
      description: "Get detailed information about the server",
      category: Category.Utilities,
      default_member_permissions: PermissionFlagsBits.UseApplicationCommands,
      options: [],
      cooldown: 5,
      dev: false,
      dm_permission: true,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;
    if (!guild) {
      return interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
    }

    const owner = await guild.fetchOwner();

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setThumbnail(guild.iconURL()!)
          .setColor("Blue").setDescription(`
            __**Server Info:**__
            > **Name:** \`${guild.name}\`
            > **ID:** \`${guild.id}\`
            > **Owner:** \`${owner.user.tag}\` - \`${owner.id}\`
            > **Created:** <t:${(guild.createdTimestamp / 1000).toFixed(0)}:R>
            > **Members:** \`${guild.memberCount}\`
            > **Channels:** \`${guild.channels.cache.size}\`
            > **Roles:** \`${guild.roles.cache.size}\`
            > **Boost Level:** \`${guild.premiumTier}\`
            > **Boost Count:** \`${guild.premiumSubscriptionCount}\`
            `),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Server Invite")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/MyvMxunzWD")
        ),
      ],
      ephemeral: true,
    });
  }
}