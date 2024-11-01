import {
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";

export default class ServersLeave extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "servers.leave",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const serverId = interaction.options.getString("server_id");

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (!serverId) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ | Please provide a valid server ID`)],
        ephemeral: true,
      });
    }

    const guild = this.client.guilds.cache.get(serverId);

    if (!guild) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ | The bot is not in a server with the ID: ${serverId}`)],
        ephemeral: true,
      });
    }

    try {
      await guild.leave();
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(`✅ | Successfully left the server: ${guild.name} (${serverId})`),
        ],
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      interaction.reply({
        embeds: [
          errorEmbed.setDescription(`❌ | An error occurred while trying to leave the server. Please try again later.`),
        ],
        ephemeral: true,
      });
    }
  }
}