import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Guild,
  TextChannel,
  DiscordAPIError,
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
      let inviteLink = "Cannot fetch invite";
      try {
        const invites = await guild.invites.fetch();
        if (invites.size > 0) {
          inviteLink = invites.first()?.url || inviteLink;
        }
      } catch {
        // Ignore the error and continue
      }

      embed.addFields({
        name: guild.name,
        value: `ID: ${guild.id} | Invite: ${inviteLink}`,
      });
    }

    try {
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (error) {
      throw error; // Throwing the error to the console
    }
  }
}
