import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  version as discordJSVersion,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import ms from "ms";
import os from "os";
const { version, dependencies } = require(`${process.cwd()}/package.json`);

export default class Botinfo extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "botinfo",
      description: "Get detailed information about the bot",
      category: Category.Utilities,
      default_member_permissions: PermissionFlagsBits.UseApplicationCommands,
      options: [],
      cooldown: 5,
      dev: false,
      dm_permission: true,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setThumbnail(this.client.user?.displayAvatarURL()!)
          .setColor("Blue").setDescription(`
            __**Bot Info:**__
            > **User:** \`${this.client.user?.tag}\` - \`${
          this.client.user?.id
        }\`
            > **Account Created:** <t:${(
              this.client.user!.createdTimestamp / 1000
            ).toFixed(0)}:R>
            > **Commands:** \`${this.client.commands.size}\`
            > **Version:** \`${version}\`
            > **NodeJS Version:** \`${process.version}\`
            > **Dependencies (${
              Object.keys(dependencies).length
            }):** \`${Object.keys(dependencies)
          .map((p) => `${p}@${dependencies[p].replace(/^\^/, "")}`)
          .join(", ")}\`
            > **Uptime:** \`${ms(this.client.uptime!, { long: false })}\`

            __**System Info:**__
            > **Operating System:** \`${process.platform}\`
            > **CPU Usage:** \`${os.cpus()[0].model.trim()}\`
            > **Ram Usage:** \`${this.formatBytes(
              process.memoryUsage().heapUsed
            )}\`/\`${this.formatBytes(os.totalmem())}\`

            __**Development Team:**__
            > **Creator/Owner:** \`Matty<3\`
            > **Developers:** \`Matty<3\`
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

  private formatBytes(bytes: number) {
    if (bytes == 0) return "0";

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  }
}
