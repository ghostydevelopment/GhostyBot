import {
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
  Collection,
  EmbedBuilder,
  GuildMember,
  Message,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class Clear extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "clear",
      description: "Clear a channel or messages from a user",
      category: Category.Moderation,
      default_member_permissions: PermissionFlagsBits.ManageMessages,
      options: [
        {
          name: "amount",
          description: "The amount of messages to clear - Limit: 100",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
        {
          name: "target",
          description:
            "Select a user to delete messages from - Default all users",
          type: ApplicationCommandOptionType.User,
          required: false,
        },
        {
          name: "channel",
          description:
            "The channel to clear messages from - Default: Current Channel.",
          type: ApplicationCommandOptionType.Channel,
          required: false,
          channel_types: [ChannelType.GuildText],
        },
        {
          name: "silent",
          description: "Don't log it to the logs channel.",
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
    let amount = interaction.options.getInteger("amount")!;
    const channel =
      (interaction.options.getChannel("channel") as TextChannel) ||
      (interaction.channel as TextChannel);
    const target = interaction.options.getMember(
      "target"
    ) as GuildMember | null;
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (amount < 1 || amount > 100)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            "⚠️ | Please enter a number between 1 and 100"
          ),
        ],
        ephemeral: true,
      });

    const messages = await channel.messages.fetch({
      limit: 100,
    });

    const filteredMessages = target
      ? messages.filter((m) => m.author.id === target.id)
      : messages;
    let deleted = 0;

    try {
      deleted = (
        await channel.bulkDelete(
          Array.from(filteredMessages.keys()).slice(0, amount),
          true
        )
      ).size;
    } catch (error) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `⚠️ | An error occurred while trying to delete messages.`
          ),
        ],
        ephemeral: true,
      });
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Orange")
          .setDescription(
            `**Deleted \`${deleted}\` messages${
              target ? ` from ${target}` : ""
            } in ${channel}`
          ),
      ],
      ephemeral: true,
    });

    if (!silent) {
      await channel
        .send({
          embeds: [
            new EmbedBuilder()
              .setColor("Orange")
              .setAuthor({ name: `🧹 | Clear | ${channel.name}` })
              .setDescription(`Deleted ${deleted} messages`)
              .setTimestamp()
              .setFooter({
                text: `${target ? target.user.tag : "All"} messages`,
              }),
          ],
        })
        .then(async (msg) => await msg.react("🧹"));
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
              .setColor("Orange")
              .setThumbnail(interaction.user.displayAvatarURL({}))
              .setDescription(
                `**Action:** Clear\n**User:** ${
                  interaction.user
                }\n**Channel:** ${channel}\n**Amount:** ${amount}\n**Target:** ${
                  target || "None"
                }`
              ),
          ],
        });
      }
    }
  }
}
