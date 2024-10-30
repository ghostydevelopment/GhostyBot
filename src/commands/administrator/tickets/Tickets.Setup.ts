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
        .setColor("#34eb4f") // Changed color to a more vibrant green for better visibility
        .setTitle("🎟️ Need Assistance? Open a Support Ticket!")
        .setDescription(
          "Our dedicated support team is ready to assist you! Click the button below to open a new support ticket. A team member will be with you shortly."
        )
        .addFields([
          {
            name: "Quick Tips",
            value:
              "Check out our FAQ section for instant answers to common questions.",
            inline: true,
          },
          {
            name: "Emergency?",
            value: "Mark your ticket as urgent after creation.",
            inline: true,
          },
        ])
        .setFooter({ text: "Your satisfaction is our priority!" })
        .setTimestamp();

      const ticketButton = new ButtonBuilder()
        .setCustomId("create_ticket")
        .setLabel("📩 Create a Support Ticket")
        .setStyle(ButtonStyle.Success) // Changed button style to Success for a more positive action color
        .setEmoji("🔔"); // Added an emoji to the button for better visual engagement

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
              .setLabel("🔒 Close Ticket")
              .setStyle(ButtonStyle.Danger);

            const ticketRow =
              new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton);

            const ticketOpenEmbed = new EmbedBuilder()
              .setColor("#00ff00")
              .setTitle(`🎫 Support Ticket #${ticketCount}`)
              .setDescription(
                welcomeMessage ||
                  "Welcome to your support ticket! Our team is here to assist you."
              )
              .addFields(
                {
                  name: "Ticket Owner",
                  value: `<@${buttonInteraction.user.id}>`,
                  inline: true,
                },
                {
                  name: "Support Team",
                  value: `<@&${supportRole.id}>`,
                  inline: true,
                },
                {
                  name: "Created At",
                  value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                  inline: false,
                },
                {
                  name: "Next Steps",
                  value:
                    "Please describe your issue in detail. A member of our support team will be with you shortly.",
                }
              )
              .setFooter({
                text: "To close this ticket, click the button below",
              })
              .setTimestamp();

            await newChannel.send({
              content: `<@${buttonInteraction.user.id}> <@&${supportRole.id}>`,
              embeds: [ticketOpenEmbed],
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

            const transcriptEmbed = new EmbedBuilder()
              .setColor("#ff9900")
              .setTitle(`📜 Ticket Transcript: ${channel.name}`)
              .setDescription("This ticket has been closed and archived.")
              .addFields(
                {
                  name: "Closed By",
                  value: `<@${closeInteraction.user.id}>`,
                  inline: true,
                },
                {
                  name: "Closed At",
                  value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                  inline: true,
                },
                {
                  name: "Transcript",
                  value: "The full conversation transcript is attached below.",
                }
              )
              .setFooter({ text: "Ticket Support System" })
              .setTimestamp();

            await transcriptChannel.send({
              embeds: [transcriptEmbed],
              files: [transcript],
            });

            const closingEmbed = new EmbedBuilder()
              .setColor("#ff0000")
              .setTitle("🔒 Ticket Closed")
              .setDescription(
                "This support ticket has been closed. A transcript has been saved for record-keeping purposes."
              )
              .addFields(
                {
                  name: "Closed By",
                  value: `<@${closeInteraction.user.id}>`,
                  inline: true,
                },
                {
                  name: "Closed At",
                  value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                  inline: true,
                },
                {
                  name: "Next Steps",
                  value:
                    "If you need further assistance, please open a new ticket.",
                }
              )
              .setFooter({ text: "Thank you for using our support system" })
              .setTimestamp();

            await closeInteraction.editReply({
              embeds: [closingEmbed],
            });

            // Delay the channel deletion to allow the user to see the closing message
            setTimeout(() => channel.delete(), 5000);
          } catch (error) {
            console.error(error);
            await closeInteraction.editReply({
              content:
                "There was an error closing the ticket. Please try again.",
            });
          }
        }
      });

      const setupSuccessEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("✅ Ticket System Setup Complete")
        .setDescription(
          "The ticket support system has been successfully configured."
        )
        .addFields(
          { name: "Category", value: `${category}`, inline: true },
          { name: "Support Role", value: `${supportRole}`, inline: true },
          {
            name: "Transcript Channel",
            value: `${transcriptChannel}`,
            inline: true,
          },
          { name: "Ticket Channel", value: `${ticketChannel}`, inline: true },
          {
            name: "Next Steps",
            value:
              "Your ticket system is now active. Users can create tickets in the designated channel.",
          }
        )
        .setFooter({ text: "Ticket system is ready to use" })
        .setTimestamp();

      return interaction.editReply({
        embeds: [setupSuccessEmbed],
      });
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("❌ Setup Error")
        .setDescription("An error occurred while setting up the ticket system.")
        .addFields(
          {
            name: "Error Details",
            value:
              "There was an unexpected issue during the setup process. Please try again or contact the bot developer if the problem persists.",
          },
          {
            name: "Troubleshooting",
            value:
              "Ensure that the bot has the necessary permissions in all channels involved in the ticket system.",
          }
        )
        .setFooter({
          text: "If issues persist, please report this to the bot developer",
        })
        .setTimestamp();

      return interaction.editReply({
        embeds: [errorEmbed],
      });
    }
  }
}
