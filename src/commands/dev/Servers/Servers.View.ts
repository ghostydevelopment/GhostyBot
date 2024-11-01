import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Guild,
  TextChannel,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";

export default class ServersView extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "servers.view",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const guilds = this.client.guilds.cache;

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("Server List")
      .setDescription("Here are the servers the bot is currently in:");

    for (const guild of guilds.values()) {
      const textChannel = guild.channels.cache.find(channel => channel instanceof TextChannel) as TextChannel;
      if (textChannel) {
        const invite = await textChannel.createInvite({
          maxAge: 0, // Permanent invite
          maxUses: 0, // Unlimited uses
        });

        embed.addFields({
          name: guild.name,
          value: `ID: ${guild.id}\nInvite: ${invite.url}`,
        });
      }
    }

    interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
}