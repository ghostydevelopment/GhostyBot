import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
  } from "discord.js";
  import Command from "../../base/classes/Command";
  import CustomClient from "../../base/classes/CustomClient";
  import Category from "../../base/enums/Category";
  
  export default class Ping extends Command {
    constructor(client: CustomClient) {
      super(client, {
        name: "ping",
        description: "Check the bot's latency and other details.",
        category: Category.Utilities,
        default_member_permissions: PermissionFlagsBits.UseApplicationCommands,
        options: [],
        cooldown: 3,
        dev: false,
        dm_permission: false,
      });
    }
  
    async Execute(interaction: ChatInputCommandInteraction) {
      const sent = await interaction.reply({ content: "Pinging...", fetchReply: true });
      const latency = sent.createdTimestamp - interaction.createdTimestamp;
      const apiLatency = Math.round(interaction.client.ws.ping);
      const uptime = this.formatUptime(interaction.client.uptime || 0);
      const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
  
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("🏓 Pong!")
            .setDescription(
              `**Latency:** ${latency}ms\n**API Latency:** ${apiLatency}ms\n**Uptime:** ${uptime}\n**Memory Usage:** ${memoryUsage.toFixed(2)} MB`
            )
            .setFooter({
              text: `Requested by ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp(),
        ],
      });
    }
  
    private formatUptime(uptime: number): string {
      const seconds = Math.floor((uptime / 1000) % 60);
      const minutes = Math.floor((uptime / (1000 * 60)) % 60);
      const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
      const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
  
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
  }