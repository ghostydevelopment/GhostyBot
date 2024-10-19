import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
  GuildChannel,
  PermissionsBitField,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/Subcommand";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class LockRemove extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "lock.remove",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const channel =
      (interaction.options.getChannel("channel") as GuildChannel) ||
      interaction.channel;
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const silent = interaction.options.getBoolean("silent") || false;

    await interaction.deferReply({ ephemeral: true });

    try {
      if (!interaction.guild) {
        throw new Error("This command can only be used in a guild.");
      }

      await channel.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: null,
        AddReactions: null,
      });

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Channel Unlocked")
        .setDescription(
          `This channel has been unlocked by ${interaction.user}.`
        )
        .addFields({ name: "Reason", value: reason })
        .setTimestamp();

      if (
        !silent &&
        channel.id !== interaction.channelId &&
        channel instanceof TextChannel
      ) {
        await channel.send({ embeds: [embed] });
      }

      if (silent) {
        const guildConfig = await GuildConfig.findOne({
          guildId: interaction.guildId,
        });
        if (guildConfig && guildConfig.logs.moderation.channelId) {
          const logChannel = (await interaction.guild.channels.fetch(
            guildConfig.logs.moderation.channelId
          )) as TextChannel;
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setColor("Yellow")
              .setTitle("Channel Unlocked (Silent)")
              .setDescription(
                `${channel} has been unlocked by ${interaction.user}.`
              )
              .addFields(
                { name: "Reason", value: reason },
                { name: "Unlocked Channel", value: channel.toString() }
              )
              .setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
          }
        }
      }

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(
              `✅ Successfully unlocked ${channel}.${
                silent ? " (Silently)" : ""
              }`
            ),
        ],
      });
    } catch (error) {
      console.error(error);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "❌ There was an error while unlocking the channel. Please try again!"
            ),
        ],
      });
    }
  }
}
