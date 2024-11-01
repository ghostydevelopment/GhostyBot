import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  User,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import GuildTickets from "../../../base/schemas/GuildTickets";
import UserAFKS from "../../../base/schemas/UserAFKS";
import UserNotes from "../../../base/schemas/UserNotes";
import UserWarns from "../../../base/schemas/UserWarns";

export default class SendHistory extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "send.history",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user") as User;
    const channel = interaction.options.getChannel("channel") as TextChannel;

    await interaction.deferReply({ ephemeral: true });

    try {
      if (!interaction.guild || !interaction.guild.members.cache.has(user.id)) {
        throw new Error("The specified user is not in this guild.");
      }

      const [tickets, afks, notes, warns] = await Promise.all([
        GuildTickets.find({ userId: user.id }),
        UserAFKS.find({ userId: user.id }),
        UserNotes.find({ userId: user.id }),
        UserWarns.find({ userId: user.id }),
      ]);

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`Moderation History for ${user.tag}`)
        .addFields(
          { name: "Tickets", value: tickets.length.toString(), inline: true },
          { name: "AFKs", value: afks.length.toString(), inline: true },
          { name: "Notes", value: notes.length.toString(), inline: true },
          { name: "Warns", value: warns.length.toString(), inline: true }
        )
        .setTimestamp();

      const row = new ActionRowBuilder<ButtonBuilder>();

      if (warns.length > 0) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId("view_warns")
            .setLabel("View Warns")
            .setStyle(ButtonStyle.Primary)
        );
      }

      if (tickets.length > 0) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId("view_tickets")
            .setLabel("View Tickets")
            .setStyle(ButtonStyle.Primary)
        );
      }

      if (afks.length > 0) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId("view_afks")
            .setLabel("View AFKs")
            .setStyle(ButtonStyle.Primary)
        );
      }

      if (notes.length > 0) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId("view_notes")
            .setLabel("View Notes")
            .setStyle(ButtonStyle.Primary)
        );
      }

      await channel.send({ embeds: [embed], components: [row] });

      const filter = (i: any) => i.user.id === interaction.user.id;
      const collector = channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

      collector.on('collect', async (i: any) => {
        let listEmbed = new EmbedBuilder().setColor("Blue").setTimestamp();
        switch (i.customId) {
          case "view_warns":
            listEmbed.setTitle(`Warns for ${user.tag}`).setDescription(warns.map((warn: any) => `Reason: ${warn.reason}`).join("\n") || "No warns found.");
            break;
          case "view_tickets":
            listEmbed.setTitle(`Tickets for ${user.tag}`).setDescription(tickets.map((ticket: any) => `Reason: ${ticket.reason}`).join("\n") || "No tickets found.");
            break;
          case "view_afks":
            listEmbed.setTitle(`AFKs for ${user.tag}`).setDescription(afks.map((afk: any) => `Reason: ${afk.reason}`).join("\n") || "No AFKs found.");
            break;
          case "view_notes":
            listEmbed.setTitle(`Notes for ${user.tag}`).setDescription(notes.map((note: any) => `Reason: ${note.reason}`).join("\n") || "No notes found.");
            break;
        }
        await i.reply({ embeds: [listEmbed], ephemeral: true });
      });

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(`✅ Successfully sent moderation history of ${user} to ${channel}.`),
        ],
      });
    } catch (error) {
      console.error(error);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ There was an error while sending the moderation history. Please try again!"),
        ],
      });
    }
  }
}