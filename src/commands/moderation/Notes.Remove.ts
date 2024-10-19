import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/Subcommand";
import GuildConfig from "../../base/schemas/GuildConfig";
import UserNotes from "../../base/schemas/UserNotes";

export default class NotesRemove extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "notes.remove",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;
    const noteId = interaction.options.getInteger("note_id")!;
    const silent = interaction.options.getBoolean("silent") ?? false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (!target) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ | Please provide a valid user`)],
        ephemeral: true,
      });
    }

    try {
      const userNotes = await UserNotes.findOne({
        userId: target.id,
        guildId: interaction.guildId,
      });

      if (!userNotes || userNotes.notes.length === 0) {
        return interaction.reply({
          embeds: [errorEmbed.setDescription(`❌ | This user has no notes.`)],
          ephemeral: true,
        });
      }

      const noteIndex = userNotes.notes.findIndex(
        (note) => note.noteId === noteId.toString()
      );

      if (noteIndex === -1) {
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription(`❌ | Note with ID ${noteId} not found.`),
          ],
          ephemeral: true,
        });
      }

      const removedNote = userNotes.notes[noteIndex];
      userNotes.notes.splice(noteIndex, 1);
      await userNotes.save();

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(
              `✅ | Removed note from ${target} - ${target.id}\nNote ID: ${noteId}`
            ),
        ],
        ephemeral: true,
      });

      if (!silent) {
        const channel = interaction.channel;
        if (channel && "send" in channel) {
          await channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor("Blue")
                .setAuthor({ name: `📝 | Note Removed - ${target.user.tag}` })
                .setThumbnail(target.displayAvatarURL({ size: 64 }))
                .setDescription(`**Removed Note:** ${removedNote.content}`)
                .setFooter({ text: `Note ID: ${noteId}` })
                .setTimestamp(),
            ],
          });

          const guild = await GuildConfig.findOne({
            guildId: interaction.guildId,
          });

          if (
            guild?.logs.moderation?.enabled &&
            guild.logs.moderation.channelId
          ) {
            const logChannel = await interaction.guild?.channels.fetch(
              guild.logs.moderation.channelId
            );
            if (logChannel && logChannel instanceof TextChannel) {
              await logChannel.send({
                embeds: [
                  new EmbedBuilder()
                    .setColor("Blue")
                    .setThumbnail(target.displayAvatarURL({ size: 64 }))
                    .setAuthor({ name: `📝 | Note Removed` })
                    .setDescription(`**Removed Note:** ${removedNote.content}`)
                    .setFooter({
                      text: `Actioned by ${interaction.user.tag} - ${interaction.user.id} | Note ID: ${noteId}`,
                      iconURL: interaction.user.displayAvatarURL({ size: 64 }),
                    })
                    .setTimestamp(),
                ],
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | An error occurred while removing the note. Please try again later.`
          ),
        ],
        ephemeral: true,
      });
    }
  }
}
