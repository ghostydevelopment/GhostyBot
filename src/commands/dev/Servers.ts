import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Servers extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "servers",
      description: "List all servers the bot is in",
      dev: true,
      default_member_permissions: PermissionFlagsBits.Administrator,
      dm_permission: false,
      category: Category.Developer,
      cooldown: 1,
      options: [], // Added the missing 'options' property
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const developers = ["1258970427141914727"]; // Replace with actual developer user IDs

    if (!developers.includes(interaction.user.id)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ | You do not have permission to use this command."),
        ],
        ephemeral: true,
      });
    }

    const guilds = this.client.guilds.cache.map((guild) => {
      const invite = guild.systemChannel
        ? guild.systemChannel.createInvite({ maxAge: 0, maxUses: 0 }).catch(() => "No invite link")
        : "No invite link";
      return {
        name: guild.name,
        id: guild.id,
        invite,
      };
    });

    const guildsInfo = await Promise.all(guilds.map(async (guild) => {
      const inviteLink = await guild.invite;
      return `**${guild.name}**\nID: ${guild.id}\nInvite: ${inviteLink}`;
    }));

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("Servers")
      .setDescription(guildsInfo.join("\n\n"));

    interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
}