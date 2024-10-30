import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  TextChannel,
  ChannelType,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Nuke extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "nuke",
      description: "Deletes channel & makes new one.",
      category: Category.Administrator,
      default_member_permissions: PermissionFlagsBits.ManageChannels,
      dm_permission: false,
      cooldown: 5,
      dev: false,
      options: [],
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.channel as TextChannel;
    if (!channel) {
      await interaction.reply({
        content: "This command can only be used in a text channel.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const channelPosition = channel.position;
    const channelName = channel.name;
    const channelTopic = channel.topic ?? undefined; // Ensure topic is undefined if null
    const channelNSFW = channel.nsfw;
    const channelRateLimitPerUser = channel.rateLimitPerUser;
    const channelParentId = channel.parentId;
    const channelPermissionOverwrites = channel.permissionOverwrites.cache.map(
      (overwrite) => ({
        id: overwrite.id,
        allow: overwrite.allow.bitfield,
        deny: overwrite.deny.bitfield,
        type: overwrite.type,
      })
    );

    try {
      // Delete the channel
      await channel.delete("Nuking the channel");

      // Recreate the channel
      const newChannel = await interaction.guild?.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        topic: channelTopic,
        nsfw: channelNSFW,
        rateLimitPerUser: channelRateLimitPerUser,
        parent: channelParentId, // Set the parent to the same as the old channel
        position: channelPosition,
        permissionOverwrites: channelPermissionOverwrites.map((overwrite) => ({
          id: overwrite.id,
          allow: overwrite.allow,
          deny: overwrite.deny,
          type: overwrite.type,
        })),
      });

      /*if (newChannel && "send" in newChannel) {
        await newChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#ff0000")
              .setTitle("🧨 Channel Nuked!")
              .setDescription("This channel has been nuked and recreated.")
              .setTimestamp(),
          ],
        });
      }

      await interaction.followUp({
        content: `The channel has been nuked and recreated successfully.`,
        ephemeral: true,
      });*/
    } catch (error) {
      await interaction.followUp({
        content: `Failed to nuke the channel: ${
          error instanceof Error ? error.message : String(error)
        }`,
        ephemeral: true,
      });
    }
  }
}
