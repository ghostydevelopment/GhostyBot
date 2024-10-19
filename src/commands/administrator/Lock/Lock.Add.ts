import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
  GuildChannel,
  PermissionsBitField,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import GuildConfig from "../../../base/schemas/GuildConfig";

export default class LockAdd extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "lock.add",
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
        SendMessages: false,
        AddReactions: false,
      });

      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Channel Locked")
        .setDescription(`This channel has been locked by ${interaction.user}.`)
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
              .setTitle("Channel Locked (Silent)")
              .setDescription(
                `${channel} has been locked by ${interaction.user}.`
              )
              .addFields(
                { name: "Reason", value: reason },
                { name: "Locked Channel", value: channel.toString() }
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
              `✅ Successfully locked ${channel}.${silent ? " (Silently)" : ""}`
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
              "❌ There was an error while locking the channel. Please try again!"
            ),
        ],
      });
    }
  }
}
