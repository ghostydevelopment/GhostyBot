import {
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class Slowmode extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "slowmode",
      description: "Set the slowmode for a channel.",
      category: Category.Moderation,
      default_member_permissions: PermissionFlagsBits.ManageChannels,
      options: [
        {
          name: "rate",
          description: "Select the slowmode message rate.",
          type: ApplicationCommandOptionType.Integer,
          required: true,
          choices: [
            { name: "None", value: 0 },
            { name: "5 seconds", value: 5 },
            { name: "10 seconds", value: 10 },
            { name: "15 seconds", value: 15 },
            { name: "30 seconds", value: 30 },
            { name: "1 minute", value: 60 },
            { name: "2 minutes", value: 120 },
            { name: "3 minutes", value: 180 },
            { name: "4 minutes", value: 240 },
            { name: "5 minutes", value: 300 },
            { name: "10 minutes", value: 600 },
            { name: "15 minutes", value: 900 },
            { name: "30 minutes", value: 1800 },
            { name: "1 hour", value: 3600 },
            { name: "2 hours", value: 7200 },
            { name: "6 hours", value: 21600 },
          ],
        },
        {
          name: "channel",
          description:
            "Select a channel to set the slowmode in - Default: Current Channel.",
          type: ApplicationCommandOptionType.Channel,
          required: false,
          channel_types: [ChannelType.GuildText],
        },
        {
          name: "reason",
          description: "The reason for the slowmode",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "silent",
          description: "Whether or not to log it.",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
      cooldown: 3,
      dm_permission: false,
      dev: false,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const messageRate = interaction.options.getInteger("rate", true);
    const channel = (interaction.options.getChannel("channel") ||
      interaction.channel) as TextChannel;
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (messageRate < 0 || messageRate > 21600) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "⚠️ | You must set the slowmode between 0 and 6 hours."
          ),
        ],
        ephemeral: true,
      });
    }

    try {
      await channel.setRateLimitPerUser(messageRate, reason);
    } catch (error) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "❌ | An error occurred while setting the slowmode."
          ),
        ],
        ephemeral: true,
      });
    }

    const formattedRate = this.formatDuration(messageRate);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(
            `✅| Successfully set the slowmode to ${formattedRate}.`
          ),
      ],
      ephemeral: true,
    });

    if (!silent) {
      await channel
        .send({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setAuthor({
                name: `<:slowmode:1299180405982887996> | Slowmode in ${channel.name}`,
              })
              .setDescription(`Slowmode set to ${formattedRate}`)
              .setTimestamp()
              .setFooter({ text: `Channel ID: ${channel.id}` }),
          ],
        })
        .then(
          async (msg) => await msg.react("<:slowmode:1299180405982887996>")
        );
    }

    const guild = await GuildConfig.findOne({ guildId: interaction.guildId });
    if (
      guild?.logs?.moderation?.enabled &&
      guild?.logs?.moderation?.channelId
    ) {
      const logChannel = await interaction.guild?.channels.fetch(
        guild.logs.moderation.channelId
      );
      if (logChannel && logChannel.type === ChannelType.GuildText) {
        await logChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setAuthor({ name: "⏲️ | Slowmode" })
              .setDescription(
                `
                **Channel:** ${channel}
                **Slowmode:** ${formattedRate}
                **Moderator:** ${interaction.user}
                **Reason:** ${reason}
              `
              )
              .setTimestamp()
              .setFooter({ text: `Slowmode ID: ${interaction.id}` }),
          ],
        });
      }
    }
  }

  formatDuration(seconds: number) {
    if (seconds === 0) return "None";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours} hour(s) ` : ""}${
      minutes > 0 ? `${minutes} minute(s) ` : ""
    }${secs > 0 ? `${secs} second(s)` : ""}`.trim();
  }
}
