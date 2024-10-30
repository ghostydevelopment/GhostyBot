import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalSubmitInteraction,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import Applications from "../../../base/schemas/Applications"; // Use Applications schema

export default class ApplicationsAdd extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "applications.add",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const open = interaction.options.getBoolean("open", true);
    const channel = interaction.options.getChannel("channel");

    // Update the Applications document for the guild with open status and channelId
    const applicationSetting = await Applications.findOneAndUpdate(
      { guildId: interaction.guildId },
      { open: open, channelId: channel?.id },
      { new: true, upsert: true }
    );

    // Create an embed message
    const embed = new EmbedBuilder()
      .setColor(open ? "Green" : "Red")
      .setDescription(
        `Application submissions have been **${
          open ? "opened" : "closed"
        }** for this server.`
      );

    // Create a modal for application questions
    const modal = new ModalBuilder()
      .setCustomId("applicationModal")
      .setTitle("Submit Your Application");

    // Add multiple text inputs for questions
    for (let i = 1; i <= 5; i++) {
      const questionInput = new TextInputBuilder()
        .setCustomId(`applicationQuestion${i}`)
        .setLabel(`Question ${i}`)
        .setStyle(TextInputStyle.Paragraph);

      const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
        questionInput
      );
      modal.addComponents(actionRow);
    }

    // Reply with the embed and show the modal
    await interaction.showModal(modal);

    // Handle modal submit interaction
    const modalInteraction = await interaction.awaitModalSubmit({
      time: 300000, // 5 minutes timeout
      filter: (i) => i.customId === "applicationModal",
    });

    // Collect responses from modal
    const responses = [];
    for (let i = 1; i <= 5; i++) {
      responses.push(
        modalInteraction.fields.getTextInputValue(`applicationQuestion${i}`)
      );
    }

    // Update the Applications document with the responses
    await Applications.findOneAndUpdate(
      { guildId: interaction.guildId },
      { $push: { applications: responses } },
      { new: true }
    );

    // Confirm submission to the user
    await modalInteraction.reply({
      content: "Applications questions have applied",
      ephemeral: true,
    });
  }
}
