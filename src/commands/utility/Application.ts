import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  TextChannel,
  Message,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import Applications from "../../base/schemas/Applications"; // Import the Applications schema

export default class ViewApplications extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "apply",
      description: "Apply for open positions in this server.",
      category: Category.Utilities,
      default_member_permissions: PermissionFlagsBits.UseApplicationCommands,
      options: [],
      cooldown: 3,
      dev: false,
      dm_permission: false,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.editReply(
        "This command can only be used in a server."
      );
    }

    const applicationData = await Applications.findOne({ guildId: guildId });
    if (!applicationData || !applicationData.open) {
      return interaction.editReply(
        "There are no open applications for this server."
      );
    }

    const questions = applicationData.applications;
    if (questions.length === 0) {
      return interaction.editReply(
        "There are currently no applications available."
      );
    }

    const user = await interaction.user.createDM();
    const answers = [];
    for (const question of questions) {
      const embed = new EmbedBuilder()
        .setTitle("<:applicant:1299183582560129146> Application Question")
        .setDescription(question)
        .setColor("#5865F2")
        .setFooter({ text: "Please respond within 60 seconds." })
        .setTimestamp();

      await user.send({ embeds: [embed] });
      const filter = (m: Message) => m.author.id === interaction.user.id;
      const collected = await user.awaitMessages({
        filter,
        max: 1,
        time: 60000,
        errors: ["time"],
      });
      const response = collected?.first()?.content;
      if (!response) {
        await user.send(
          "<:slowmode:1299180405982887996> You did not answer in time."
        );
        return interaction.editReply(
          "Application process terminated due to no response."
        );
      }
      answers.push(response);
    }

    await user.send(
      "<a:animatedcheck:1299178944481984522> Application submitted"
    );

    const responseEmbed = new EmbedBuilder()
      .setTitle("<a:animatedcheck:1299178944481984522> Application Responses")
      .setDescription(`> ${answers.join("\n\n")}`)
      .setColor("#57F287")
      .setFooter({
        text: `User ID: ${interaction.user.id}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    if (!applicationData.channelId) {
      return interaction.editReply(
        "Error: No channel specified for application responses."
      );
    }

    const channel = (await interaction.client.channels.fetch(
      applicationData.channelId
    )) as TextChannel;
    if (!channel) {
      return interaction.editReply(
        "Error: The specified channel could not be found."
      );
    }

    await channel.send({ embeds: [responseEmbed] });

    return interaction.editReply(
      "Thank you for completing the application. Your responses have been submitted."
    );
  }
}
