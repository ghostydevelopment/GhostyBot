import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/Subcommand";
import UserNotes from "../../base/schemas/UserNotes";

export default class NotesList extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "notes.list",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (!target)
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ | Please provide a valid user`)],
        ephemeral: true,
      });

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

      const notesEmbed = new EmbedBuilder()
        .setColor("Blue")
        .setAuthor({ name: `📝 | Notes for ${target.user.tag}` })
        .setThumbnail(target.displayAvatarURL({ size: 64 }))
        .setTimestamp();

      userNotes.notes.forEach((note, index) => {
        notesEmbed.addFields({
          name: `Note ${index + 1} (ID: ${note.noteId})`,
          value: `${note.content}\nAdded by <@${
            note.moderatorId
          }> on ${note.createdAt.toLocaleString()}`,
        });
      });

      await interaction.reply({
        embeds: [notesEmbed],
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | An error occurred while fetching the notes. Please try again later.`
          ),
        ],
        ephemeral: true,
      });
    }
  }
}
