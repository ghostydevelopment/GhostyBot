import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    MessageComponentInteraction,
    InteractionCollector,
    TextChannel,
  } from "discord.js";
  import Command from "../../base/classes/Command";
  import CustomClient from "../../base/classes/CustomClient";
  import Category from "../../base/enums/Category";
  
  const changelogs = {
    version: "1.0.1",
    date: "10/27/2024",
    changes: [
      {
        type: "Added",
        description: "Added anti-raid protection system to the `/filters` command and `/init` command."
      },
      {
        type: "Added",
        description: "Added a series of backup server commands incase nuke happens."
      },
      {
        type: "Added",
        description: "Added `/stealemoji` to steal emojis from other servers and upload it to your own server."
      },
      {
        type: "Updated",
        description: "Announcement command now has option of urgency."
      },
      {
        type: "Updated",
        description: "Updated `/init` with better embeds & buttons"
      },
      {
        type: "Updated",
        description: "Updated `/filters` so all the filters are under one command."
      },
      {
        type: "Updated",
        description: "Filters now have nickname filtering."
      },
      {
        type: "Fixed",
        description: "Fixed a bug where the filters would not work if the bot was restarted."
      },
      {
        type: "Fixed",
        description: "Fixed the init embed buttons."
      },
      {
        type: "Updated",
        description: "Updated the `/init` command with new buttons and a better overall style to the embeds."
      },
    ]
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
      const categories = Object.values(Category).sort((a, b) => a.localeCompare(b));
      let description = '';

      categories.forEach(category => {
        const commandsInCategory = this.client.commands.filter(cmd => cmd.category === category && !cmd.dev);
        if (commandsInCategory.size > 0) {
          description += `**${category}**\n`;
          commandsInCategory.forEach(cmd => {
            description += `\`${cmd.name}\`: ${cmd.description}\n`;
          });
          description += '\n';
        }
      });

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("Available Commands")
        .setDescription(description);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("changelog")
          .setLabel("Changelog")
          .setStyle(ButtonStyle.Primary)
      );
  
      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });

      const filter = (i: MessageComponentInteraction) => i.customId === "changelog" && i.user.id === interaction.user.id;
      const collector = (interaction.channel as TextChannel)?.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

      collector?.on("collect", async (i: MessageComponentInteraction) => {
        if (i.customId === "changelog") {
          await i.deferUpdate();
          const changelogEmbed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("Changelog")
            .setDescription(`Version: ${changelogs.version}\nDate: ${changelogs.date}`);

          const changesByType = changelogs.changes.reduce((acc, change) => {
            if (!acc[change.type]) acc[change.type] = [];
            acc[change.type].push(change.description);
            return acc;
          }, {} as Record<string, string[]>);

          for (const [type, descriptions] of Object.entries(changesByType)) {
            changelogEmbed.addFields({ name: `**${type}**`, value: descriptions.map(desc => `- ${desc}`).join("\n") });
          }

          await i.user.send({ embeds: [changelogEmbed] });
        }
      });
    }
  }