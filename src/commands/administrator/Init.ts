import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageComponentInteraction,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import GuildConfig from "../../base/schemas/GuildConfig";
import Filters from "../../base/schemas/Filters";

export default class Init extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "init",
      description: "Initialize and check bot configurations",
      category: Category.Administrator,
      default_member_permissions: PermissionFlagsBits.Administrator,
      dm_permission: false,
      cooldown: 5,
      dev: false,
      options: [
        {
          name: "detailed",
          description: "Show detailed information for each check",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply();

      const detailed = interaction.options.getBoolean("detailed") ?? false;

      const embed = new EmbedBuilder()
        .setColor("#4287f5")
        .setTitle(
          "<a:animatedcheck:1299178944481984522> Nova Bot Initialization Check"
        )
        .setDescription("Performing system diagnostics...")
        .setThumbnail(this.client.user?.displayAvatarURL() || null)
        .setFooter({ text: "Ensuring optimal performance for your server" })
        .setTimestamp();

      const message = await interaction.editReply({ embeds: [embed] });

      const checks = [this.checkLogsChannel, this.checkBotPermissions, this.checkAutomod];

      const results = await Promise.all(
        checks.map((check) => check(interaction, detailed))
      );

      results.forEach((result) => {
        embed.addFields(result);
      });

      const allChecksPass = results.every((result) =>
        result.value.startsWith("<a:animatedcheck:1299178944481984522>")
      );

      if (allChecksPass) {
        embed
          .setDescription(
            "<:tada1:1299179698756124753> All systems operational! Nova is ready to serve."
          )
          .setColor("#00ff00")
          .addFields({
            name: "<a:123trophy:1300218651487764571> Overall Status",
            value:
              "<a:animatedcheck:1299178944481984522> Perfectly configured and ready for action!",
          });
      } else {
        embed
          .setDescription(
            "<:caution2:1299182360436146297> Some systems require attention. Please review the details below."
          )
          .setColor("#ff9900")
          .addFields({
            name: "🔧 Overall Status",
            value:
              "<:caution2:1299182360436146297> Configuration adjustments needed for optimal performance.",
          });
      }

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("fix_issues")
          .setLabel("Fix Issues")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(allChecksPass),
        new ButtonBuilder()
          .setCustomId("view_guide")
          .setLabel("View Setup Guide")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("automod")
          .setLabel("Automod")
          .setStyle(ButtonStyle.Secondary)
      );

      await message.edit({ embeds: [embed], components: [row] });

      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000,
      });

      collector.on("collect", async (i: MessageComponentInteraction) => {
        if (i.customId === "fix_issues") {
          await this.handleFixIssues(i, results, embed, row);
        } else if (i.customId === "view_guide") {
          await this.handleViewGuide(i, embed, row);
        } else if (i.customId === "automod") {
          await this.handleAutomod(i, embed, row);
        }
      });

      collector.on("end", async () => {
        await message.edit({ components: [] });
      });
    } catch (error) {
      throw error;
    }
  }

  private async checkLogsChannel(
    interaction: ChatInputCommandInteraction,
    detailed: boolean
  ) {
    try {
      const guildConfig = await GuildConfig.findOne({
        guildId: interaction.guildId,
      });
      const logsEnabled = guildConfig?.logs?.moderation?.enabled;
      const value = logsEnabled
        ? "<a:animatedcheck:1299178944481984522> Enabled and ready"
        : "<:error1:1299179356412711063> Not configured";

      if (detailed && logsEnabled) {
        const channelId = guildConfig?.logs?.moderation?.channelId;
        const channel = interaction.guild?.channels.cache.get(
          channelId as string
        ) as TextChannel;
        return {
          name: "<:logs:1299180220959555645> Logs Channel",
          value: `${value}\nChannel: ${
            channel ? channel.toString() : "Not found"
          }`,
          inline: true,
        };
      }

      return {
        name: "<:logs:1299180220959555645> Logs Channel",
        value,
        inline: true,
      };
    } catch (error) {
      throw error;
    }
  }

  private async checkBotPermissions(
    interaction: ChatInputCommandInteraction,
    detailed: boolean
  ) {
    try {
      const botMember = interaction.guild?.members.me;
      const requiredPermissions = [
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.BanMembers,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
      ];
      const hasPermissions = botMember?.permissions.has(requiredPermissions);
      const value = hasPermissions
        ? "<a:animatedcheck:1299178944481984522> All permissions granted"
        : "<:error1:1299179356412711063> Missing critical permissions";

      if (detailed && !hasPermissions) {
        const missingPerms = requiredPermissions.filter(
          (perm) => !botMember?.permissions.has(perm)
        );
        const missingPermNames = missingPerms
          .map((perm) => {
            const permName = Object.keys(PermissionFlagsBits).find(
              (key) =>
                PermissionFlagsBits[key as keyof typeof PermissionFlagsBits] ===
                perm
            );
            return permName || "Unknown Permission";
          })
          .join(", ");
        return {
          name: "<:123e:1300218149005692948> Bot Permissions",
          value: `${value}\nMissing: ${missingPermNames}`,
          inline: true,
        };
      }

      return { name: "<:123e:1300218149005692948> Bot Permissions", value, inline: true };
    } catch (error) {
      throw error;
    }
  }

  private async checkAutomod(
    interaction: ChatInputCommandInteraction,
    detailed: boolean
  ) {
    try {
      const filters = await Filters.findOne({ guildId: interaction.guildId });
      const linkFilteringEnabled = filters?.links ?? false;
      const wordFilteringEnabled = filters?.words ?? false;
      const nicknameFilteringEnabled = filters?.nicknames ?? false;
      const raidFilteringEnabled = filters?.raid ?? false;
      const automodStatus = `${linkFilteringEnabled ? 1 : 0}/4`;

      return {
        name: "Automod",
        value: automodStatus,
        inline: true,
      };
    } catch (error) {
      throw error;
    }
  }

  private async handleFixIssues(
    interaction: MessageComponentInteraction,
    results: any[],
    previousEmbed: EmbedBuilder,
    previousRow: ActionRowBuilder<ButtonBuilder>
  ) {
    try {
      await interaction.deferUpdate();
      const issuesEmbed = new EmbedBuilder()
        .setColor("#ff9900")
        .setTitle("<:caution2:1299182360436146297> Issues to Fix")
        .setDescription("Here are the steps to resolve the identified issues:");

      results.forEach((result, index) => {
        if (!result.value.startsWith("<a:animatedcheck:1299178944481984522>")) {
          issuesEmbed.addFields({
            name: `${index + 1}. ${result.name}`,
            value: this.getFixInstructions(result.name),
          });
        }
      });

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.editReply({ embeds: [issuesEmbed], components: [row] });

      const collector = interaction.message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000,
      });

      collector.on("collect", async (i: MessageComponentInteraction) => {
        if (i.customId === "previous") {
          await interaction.editReply({ embeds: [previousEmbed], components: [previousRow] });
        }
      });

      collector.on("end", async () => {
        await interaction.editReply({ components: [] });
      });
    } catch (error) {
      throw error;
    }
  }

  private getFixInstructions(issueName: string): string {
    const instructions: { [key: string]: string } = {
      "<:logs:1299180220959555645> Logs Channel":
        "Use `/logs set` to set up a logging channel.",
      "<:123e:1300218149005692948> Bot Permissions":
        "Ensure the bot has the necessary permissions in Server Settings > Roles.",
    };

    return (
      instructions[issueName] ||
      "Please refer to the documentation for setup instructions."
    );
  }

  private async handleViewGuide(interaction: MessageComponentInteraction, previousEmbed: EmbedBuilder, previousRow: ActionRowBuilder<ButtonBuilder>) {
    try {
      await interaction.deferUpdate();
      const guideEmbed = new EmbedBuilder()
        .setColor("#4287f5")
        .setTitle("📚 Nova Bot Setup Guide")
        .setDescription("Follow these steps to configure Nova Bot:")
        .addFields(
          {
            name: "1. Set Up Logging",
            value: "Use `/logs set` to configure a logging channel.",
          },
          {
            name: "2. Verify Permissions",
            value:
              "Ensure Nova has all necessary permissions in your server settings.",
          },
          {
            name: "3. Regular Maintenance",
            value:
              "Run `/init` periodically to ensure everything is running smoothly.",
          }
        )
        .setFooter({
          text: "For more detailed instructions, visit our documentation website.",
        });

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.editReply({ embeds: [guideEmbed], components: [row] });

      const collector = interaction.message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000,
      });

      collector.on("collect", async (i: MessageComponentInteraction) => {
        if (i.customId === "previous") {
          await interaction.editReply({ embeds: [previousEmbed], components: [previousRow] });
        }
      });

      collector.on("end", async () => {
        await interaction.editReply({ components: [] });
      });
    } catch (error) {
      throw error;
    }
  }

  private async handleAutomod(interaction: MessageComponentInteraction, previousEmbed: EmbedBuilder, previousRow: ActionRowBuilder<ButtonBuilder>) {
    try {
      await interaction.deferUpdate();

      const filters = await Filters.findOne({ guildId: interaction.guildId });
      const linkFilteringEnabled = filters?.links ?? false;
      const wordFilteringEnabled = filters?.words ?? false;
      const nicknameFilteringEnabled = filters?.nicknames ?? false;
      const raidFilteringEnabled = filters?.raid ?? false;

      const automodEmbed = new EmbedBuilder()
        .setColor("#4287f5")
        .setTitle("Automod Configuration")
        .addFields(
          {
            name: "Link Filtering",
            value: linkFilteringEnabled
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          },
          {
            name: "Word Filtering",
            value: wordFilteringEnabled
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          },
          {
            name: "Nickname Filtering",
            value: nicknameFilteringEnabled
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          },
          {
            name: "Raid Filtering",
            value: raidFilteringEnabled
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          }
        );

      const automodRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("toggle_link_filtering")
          .setLabel("Link Filtering")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("toggle_word_filtering")
          .setLabel("Word Filtering")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("toggle_nickname_filtering")
          .setLabel("Nickname Filtering")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("toggle_raid_filtering")
          .setLabel("Raid Filtering")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.editReply({ embeds: [automodEmbed], components: [automodRow] });

      const automodCollector = interaction.message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000,
      });

      automodCollector.on("collect", async (i: MessageComponentInteraction) => {
        if (i.customId === "toggle_link_filtering") {
          await this.toggleLinkFiltering(i, previousEmbed, previousRow);
        } else if (i.customId === "toggle_word_filtering") {
          await this.toggleWordFiltering(i, previousEmbed, previousRow);
        } else if (i.customId === "toggle_nickname_filtering") {
          await this.toggleNicknameFiltering(i, previousEmbed, previousRow);
        } else if (i.customId === "toggle_raid_filtering") {
          await this.toggleRaidFiltering(i, previousEmbed, previousRow);
        } else if (i.customId === "previous") {
          await interaction.editReply({ embeds: [previousEmbed], components: [previousRow] });
        }
      });

      automodCollector.on("end", async () => {
        await interaction.editReply({ components: [] });
      });
    } catch (error) {
      throw error;
    }
  }

  private async toggleLinkFiltering(interaction: MessageComponentInteraction, previousEmbed: EmbedBuilder, previousRow: ActionRowBuilder<ButtonBuilder>) {
    try {
      const filters = await Filters.findOne({ guildId: interaction.guildId });
      const linkFilteringEnabled = filters?.links ?? false;

      await Filters.updateOne(
        { guildId: interaction.guildId },
        { $set: { links: !linkFilteringEnabled } },
        { upsert: true }
      );

      const updatedEmbed = new EmbedBuilder()
        .setColor("#4287f5")
        .setTitle("Automod Configuration")
        .addFields(
          {
            name: "Link Filtering",
            value: !linkFilteringEnabled
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          },
          {
            name: "Word Filtering",
            value: filters?.words
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          },
          {
            name: "Nickname Filtering",
            value: filters?.nicknames
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          },
          {
            name: "Raid Filtering",
            value: filters?.raid
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          }
        );

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.update({ embeds: [updatedEmbed], components: [row] });

      const collector = interaction.message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000,
      });

      collector.on("collect", async (i: MessageComponentInteraction) => {
        if (i.customId === "previous") {
          await interaction.editReply({ embeds: [previousEmbed], components: [previousRow] });
        }
      });

      collector.on("end", async () => {
        await interaction.editReply({ components: [] });
      });
    } catch (error) {
      throw error;
    }
  }

  private async toggleWordFiltering(interaction: MessageComponentInteraction, previousEmbed: EmbedBuilder, previousRow: ActionRowBuilder<ButtonBuilder>) {
    try {
      const filters = await Filters.findOne({ guildId: interaction.guildId });
      const wordFilteringEnabled = filters?.words ?? false;

      await Filters.updateOne(
        { guildId: interaction.guildId },
        { $set: { words: !wordFilteringEnabled } },
        { upsert: true }
      );

      const updatedEmbed = new EmbedBuilder()
        .setColor("#4287f5")
        .setTitle("Automod Configuration")
        .addFields(
          {
            name: "Link Filtering",
            value: filters?.links
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          },
          {
            name: "Word Filtering",
            value: !wordFilteringEnabled
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          },
          {
            name: "Nickname Filtering",
            value: filters?.nicknames
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          },
          {
            name: "Raid Filtering",
            value: filters?.raid
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          }
        );

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.update({ embeds: [updatedEmbed], components: [row] });

      const collector = interaction.message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000,
      });

      collector.on("collect", async (i: MessageComponentInteraction) => {
        if (i.customId === "previous") {
          await interaction.editReply({ embeds: [previousEmbed], components: [previousRow] });
        }
      });

      collector.on("end", async () => {
        await interaction.editReply({ components: [] });
      });
    } catch (error) {
      throw error;
    }
  }

  private async toggleNicknameFiltering(interaction: MessageComponentInteraction, previousEmbed: EmbedBuilder, previousRow: ActionRowBuilder<ButtonBuilder>) {
    try {
      const filters = await Filters.findOne({ guildId: interaction.guildId });
      const nicknameFilteringEnabled = filters?.nicknames ?? false;

      await Filters.updateOne(
        { guildId: interaction.guildId },
        { $set: { nicknames: !nicknameFilteringEnabled } },
        { upsert: true }
      );

      const updatedEmbed = new EmbedBuilder()
        .setColor("#4287f5")
        .setTitle("Automod Configuration")
        .addFields(
          {
            name: "Link Filtering",
            value: filters?.links
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          },
          {
            name: "Word Filtering",
            value: filters?.words
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          },
          {
            name: "Nickname Filtering",
            value: !nicknameFilteringEnabled
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          },
          {
            name: "Raid Filtering",
            value: filters?.raid
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          }
        );

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.update({ embeds: [updatedEmbed], components: [row] });

      const collector = interaction.message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000,
      });

      collector.on("collect", async (i: MessageComponentInteraction) => {
        if (i.customId === "previous") {
          await interaction.editReply({ embeds: [previousEmbed], components: [previousRow] });
        }
      });

      collector.on("end", async () => {
        await interaction.editReply({ components: [] });
      });
    } catch (error) {
      throw error;
    }
  }

  private async toggleRaidFiltering(interaction: MessageComponentInteraction, previousEmbed: EmbedBuilder, previousRow: ActionRowBuilder<ButtonBuilder>) {
    try {
      const filters = await Filters.findOne({ guildId: interaction.guildId });
      const raidFilteringEnabled = filters?.raid ?? false;

      await Filters.updateOne(
        { guildId: interaction.guildId },
        { $set: { raid: !raidFilteringEnabled } },
        { upsert: true }
      );

      const updatedEmbed = new EmbedBuilder()
        .setColor("#4287f5")
        .setTitle("Automod Configuration")
        .addFields(
          {
            name: "Link Filtering",
            value: filters?.links
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          },
          {
            name: "Word Filtering",
            value: filters?.words
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          },
          {
            name: "Nickname Filtering",
            value: filters?.nicknames
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          },
          {
            name: "Raid Filtering",
            value: !raidFilteringEnabled
              ? "<a:animatedcheck:1299178944481984522> Enabled"
              : "<:error1:1299179356412711063> Disabled",
            inline: true,
          }
        );

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.update({ embeds: [updatedEmbed], components: [row] });

      const collector = interaction.message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300000,
      });

      collector.on("collect", async (i: MessageComponentInteraction) => {
        if (i.customId === "previous") {
          await interaction.editReply({ embeds: [previousEmbed], components: [previousRow] });
        }
      });

      collector.on("end", async () => {
        await interaction.editReply({ components: [] });
      });
    } catch (error) {
      throw error;
    }
  }
}
