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
      embed.addFields({
        name: guild.name,
        value: `ID: ${guild.id}`,
      });
    }

    try {
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (error) {
      if (error instanceof DiscordAPIError && error.code === 10062) {
        console.error("Unknown interaction error:", error);
      } else {
        console.error("Failed to reply to interaction:", error);
      }
    }
  }
}
