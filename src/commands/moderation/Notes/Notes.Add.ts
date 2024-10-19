import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  TextChannel,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import GuildConfig from "../../../base/schemas/GuildConfig";
import UserNotes from "../../../base/schemas/UserNotes";

export default class NotesAdd extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "notes.add",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember("target") as GuildMember;
    const note = interaction.options.getString("note")!;
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (!target)
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ | Please provide a valid user`)],
        ephemeral: true,
      });

    if (note.length > 1024)
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | Note must be less than 1024 characters`
          ),
        ],
        ephemeral: true,
      });

    try {
      const noteId = new Date().getTime().toString();
      const userNotes = await UserNotes.findOneAndUpdate(
        { userId: target.id, guildId: interaction.guildId },
        {
          $push: {
            notes: {
              noteId: noteId,
              content: note,
              moderatorId: interaction.user.id,
              createdAt: new Date(),
            },
          },
        },
        { upsert: true, new: true }
      );

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(
              `✅ | Added note to ${target} - ${target.id}\nNote ID: ${noteId}`
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
                .setAuthor({ name: `📝 | Note Added - ${target.user.tag}` })
                .setThumbnail(target.displayAvatarURL({ size: 64 }))
                .setDescription(`**Note:** ${note}`)
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
            const logChannel = (await interaction.guild?.channels.fetch(
              guild.logs.moderation.channelId
            )) as TextChannel;
            if (logChannel) {
              await logChannel.send({
                embeds: [
                  new EmbedBuilder()
                    .setColor("Blue")
                    .setThumbnail(target.displayAvatarURL({ size: 64 }))
                    .setAuthor({ name: `📝 | Note Added` })
                    .setDescription(`**Note:** ${note}`)
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
            `❌ | An error occurred while adding the note. Please try again later.`
          ),
        ],
        ephemeral: true,
      });
    }
  }
}
