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

export default class LockdownAdd extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "lockdown.add",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const silent = interaction.options.getBoolean("silent") || false;

    await interaction.deferReply({ ephemeral: true });

    try {
      if (!interaction.guild) {
        throw new Error("This command can only be used in a guild.");
      }

      const channels = await interaction.guild.channels.fetch();

      for (const [, channel] of channels) {
        if (channel && (channel.isTextBased() || channel.isVoiceBased())) {
          try {
            await channel.permissionOverwrites.edit(interaction.guild.id, {
              SendMessages: false,
              AddReactions: false,
              Connect: false,
              Speak: false,
            });
          } catch (error: unknown) {
            if (error instanceof Error) {
              throw new Error(
                `Failed to lock channel ${channel.name}: ${error.message}`
              );
            } else {
              throw new Error(
                `Failed to lock channel ${channel.name}: Unknown error`
              );
            }
          }
        }
      }

      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Server Lockdown")
        .setDescription(
          `This server has been locked down by ${interaction.user}.`
        )
        .addFields({ name: "Reason", value: reason })
        .setTimestamp();

      if (!silent && interaction.channel instanceof TextChannel) {
        try {
          await interaction.channel.send({ embeds: [embed] });
        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(
              `Failed to send lockdown message: ${error.message}`
            );
          } else {
            throw new Error("Failed to send lockdown message: Unknown error");
          }
        }
      }

      if (silent) {
        const guildConfig = await GuildConfig.findOne({
          guildId: interaction.guildId,
        });
        if (guildConfig?.logs?.moderation?.channelId) {
          const logChannel = await interaction.guild.channels.fetch(
            guildConfig.logs.moderation.channelId
          );
          if (logChannel instanceof TextChannel) {
            const logEmbed = new EmbedBuilder()
              .setColor("Yellow")
              .setTitle("Server Lockdown (Silent)")
              .setDescription(
                `The server has been locked down by ${interaction.user}.`
              )
              .addFields({ name: "Reason", value: reason })
              .setTimestamp();
            try {
              await logChannel.send({ embeds: [logEmbed] });
            } catch (error: unknown) {
              if (error instanceof Error) {
                throw new Error(
                  `Failed to send silent lockdown log: ${error.message}`
                );
              } else {
                throw new Error(
                  "Failed to send silent lockdown log: Unknown error"
                );
              }
            }
          }
        }
      }

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(
              `✅ Successfully locked down the server.${
                silent ? " (Silently)" : ""
              }`
            ),
        ],
      });
    } catch (error: unknown) {
      console.error(error);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              `❌ There was an error while locking down the server: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            ),
        ],
      });
    }
  }
}
