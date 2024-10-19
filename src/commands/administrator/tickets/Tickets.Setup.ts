import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
  CategoryChannel,
  Role,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import GuildTickets from "../../../base/schemas/GuildTickets";
import { createTranscript } from "discord-html-transcripts";

export default class TicketsSetup extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "tickets.setup",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const category = interaction.options.getChannel(
      "category"
    ) as CategoryChannel;
    const supportRole = interaction.options.getRole("support-role") as Role;
    const transcriptChannel = interaction.options.getChannel(
      "transcript-channel"
    ) as TextChannel;
    const ticketChannel = interaction.options.getChannel(
      "ticket-channel"
    ) as TextChannel;
    const welcomeMessage = interaction.options.getString("welcome-message");

    await interaction.deferReply({ ephemeral: true });

    try {
      let guildTickets = await GuildTickets.findOne({
        guildId: interaction.guildId,
      });

      if (!guildTickets) {
        guildTickets = await GuildTickets.create({
          guildId: interaction.guildId,
          enabled: true,
          category: category.id,
          supportRole: supportRole.id,
          transcriptChannel: transcriptChannel.id,
          ticketChannel: ticketChannel.id,
          welcomeMessage: welcomeMessage || undefined,
        });
      } else {
        guildTickets.enabled = true;
        guildTickets.category = category.id;
        guildTickets.supportRole = supportRole.id;
        guildTickets.transcriptChannel = transcriptChannel.id;
        guildTickets.ticketChannel = ticketChannel.id;
        if (welcomeMessage) guildTickets.welcomeMessage = welcomeMessage;
        await guildTickets.save();
      }

      const ticketEmbed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("Create a Ticket")
        .setDescription("Click the button below to create a new ticket.");

      const ticketButton = new ButtonBuilder()
        .setCustomId("create_ticket")
        .setLabel("Create Ticket")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        ticketButton
      );

      await ticketChannel.send({
        embeds: [ticketEmbed],
        components: [row],
      });

      // Set up the button interaction handler
      this.client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;
        if (interaction.customId === "create_ticket") {
          const buttonInteraction = interaction as ButtonInteraction;
          await buttonInteraction.deferReply({ ephemeral: true });

          try {
            const guild = buttonInteraction.guild;
            if (!guild) throw new Error("Guild not found");

            const ticketCount =
              (
                await GuildTickets.findOneAndUpdate(
                  { guildId: guild.id },
                  { $inc: { ticketCount: 1 } },
                  { new: true }
                )
              )?.ticketCount || 1;

            const newChannel = await guild.channels.create({
              name: `ticket-${ticketCount}`,
              type: ChannelType.GuildText,
              parent: category,
              permissionOverwrites: [
                {
                  id: guild.id,
                  deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                  id: buttonInteraction.user.id,
                  allow: [PermissionFlagsBits.ViewChannel],
                },
                {
                  id: supportRole.id,
                  allow: [PermissionFlagsBits.ViewChannel],
                },
              ],
            });

            const closeButton = new ButtonBuilder()
              .setCustomId("close_ticket")
              .setLabel("Close")
              .setStyle(ButtonStyle.Danger);

            const ticketRow =
              new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton);

            await newChannel.send({
              content: `<@${buttonInteraction.user.id}> <@&${supportRole.id}>`,
              embeds: [
                new EmbedBuilder()
                  .setColor("Blue")
                  .setTitle(`Ticket #${ticketCount}`)
                  .setDescription(
                    welcomeMessage ||
                      "Welcome to your ticket! Please describe your issue and a staff member will be with you shortly."
                  ),
              ],
              components: [ticketRow],
            });

            await buttonInteraction.editReply({
              content: `Your ticket has been created: ${newChannel}`,
            });
          } catch (error) {
            console.error(error);
            await buttonInteraction.editReply({
              content:
                "There was an error creating your ticket. Please try again.",
            });
          }
        } else if (interaction.customId === "close_ticket") {
          const closeInteraction = interaction as ButtonInteraction;
          await closeInteraction.deferReply({ ephemeral: true });

          try {
            const channel = closeInteraction.channel as TextChannel;
            const guildTickets = await GuildTickets.findOne({
              guildId: closeInteraction.guildId,
            });

            if (!guildTickets) throw new Error("Guild tickets not found");

            const transcript = await createTranscript(channel, {
              limit: -1,
              filename: `${channel.name}-transcript.html`,
            });

            const transcriptChannel =
              closeInteraction.guild?.channels.cache.get(
                guildTickets.transcriptChannel
              ) as TextChannel;

            await transcriptChannel.send({
              content: `Transcript for ${channel.name}`,
              files: [transcript],
            });

            await closeInteraction.editReply({
              content: "Ticket closed and transcript sent to logs channel.",
            });

            await channel.delete();
          } catch (error) {
            console.error(error);
            await closeInteraction.editReply({
              content:
                "There was an error closing the ticket. Please try again.",
            });
          }
        }
      });

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(
              `✅ Ticket system has been set up successfully!\n\nCategory: ${category}\nSupport Role: ${supportRole}\nTranscript Channel: ${transcriptChannel}\nTicket Channel: ${ticketChannel}`
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
              `❌ There was an error while setting up the ticket system. Please try again!`
            ),
        ],
      });
    }
  }
}
