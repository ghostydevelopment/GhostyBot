import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageComponentInteraction,
  TextChannel,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

const changelogs = {
  version: "1.0.3",
  date: "10/31/2024",
  changes: [
    { type: "Added", description: "Added `/ban mass` command." },
    { type: "Added", description: "Added `/crisis` command." },
    { type: "Added", description: "Added `/profile` command." },
    { type: "Added", description: "Added `/serverstats` command." },
    { type: "Added", description: "Added `/userlookup` command." },
    { type: "Added", description: "Added `/send` command & subcommands." },
    {
      type: "Added",
      description: "Added `/archieve` command to archive a channel.",
    },
    { type: "Fixed", description: "The status of the bot." },
  ],
};

export default class Help extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "help",
      description: "List all available commands",
      category: Category.Utilities,
      default_member_permissions: PermissionFlagsBits.UseApplicationCommands,
      options: [],
      cooldown: 5,
      dev: false,
      dm_permission: true,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const categories = Object.values(Category).sort((a, b) =>
      a.localeCompare(b)
    );
    let description = "";

    categories.forEach((category) => {
      const commandsInCategory = this.client.commands.filter(
        (cmd) => cmd.category === category && !cmd.dev
      );
      if (commandsInCategory.size > 0) {
        description += `**${category}**\n`;
        commandsInCategory.forEach((cmd) => {
          description += `\`${cmd.name}\`: ${cmd.description}\n`;
        });
        description += "\n";
      }
    });

    const embed = new EmbedBuilder()
      .setColor("#3498db") // A more visually appealing blue
      .setTitle("🛠️ Available Commands")
      .setDescription(description || "No commands available.")
      .setFooter({
        text: "Use these commands wisely!",
        iconURL: this.client.user?.displayAvatarURL(),
      })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("changelog")
        .setLabel("View Changelog")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });

    const filter = (i: MessageComponentInteraction) =>
      i.customId === "changelog" && i.user.id === interaction.user.id;
    const collector = (
      interaction.channel as TextChannel
    )?.createMessageComponentCollector({
      filter,
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector?.on("collect", async (i: MessageComponentInteraction) => {
      if (i.customId === "changelog") {
        await i.deferUpdate();
        const changelogEmbed = new EmbedBuilder()
          .setColor("#2ecc71") // A more visually appealing green
          .setTitle("📜 Changelog")
          .setDescription(
            `**Version:** ${changelogs.version}\n**Date:** ${changelogs.date}`
          )
          .setFooter({
            text: "Updates and improvements",
            iconURL: this.client.user?.displayAvatarURL(),
          })
          .setTimestamp();

        const changesByType = changelogs.changes.reduce((acc, change) => {
          if (!acc[change.type]) acc[change.type] = [];
          acc[change.type].push(change.description);
          return acc;
        }, {} as Record<string, string[]>);

        for (const [type, descriptions] of Object.entries(changesByType)) {
          changelogEmbed.addFields({
            name: `**${type}**`,
            value: descriptions.map((desc) => `- ${desc}`).join("\n"),
          });
        }

        await i.user.send({ embeds: [changelogEmbed] });
      }
    });
  }
}
