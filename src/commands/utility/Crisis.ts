import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  StringSelectMenuInteraction,
  TextChannel,
  Collector,
  Interaction,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Crisis extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "crisis",
      description: "Get help during a crisis",
      category: Category.Utilities,
      default_member_permissions: PermissionFlagsBits.UseApplicationCommands,
      options: [],
      cooldown: 5,
      dev: false,
      dm_permission: true,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("🚨 Crisis Help 🚨")
      .setDescription(
        `
                If you are in crisis, please use the following resources:
                > **National Suicide Prevention Lifeline:** 1-800-273-8255
                > **Crisis Text Line:** Text HOME to 741741
                > **Emergency Services:** 911
                > **International Resources:** [Find Help](https://www.iasp.info/resources/Crisis_Centres/)
            `
      )
      .setFooter({ text: "You are not alone. Help is available." })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Call National Suicide Prevention Lifeline")
        .setStyle(ButtonStyle.Link)
        .setURL("https://www.suicidepreventionlifeline.org"),
      new ButtonBuilder()
        .setLabel("Text Crisis Text Line")
        .setStyle(ButtonStyle.Link)
        .setURL("https://www.crisistextline.org"),
      new ButtonBuilder()
        .setLabel("Find International Resources")
        .setStyle(ButtonStyle.Link)
        .setURL("https://www.iasp.info/resources/Crisis_Centres/")
    );

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("crisis_resources")
      .setPlaceholder("Select a resource for more information")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("National Suicide Prevention Lifeline")
          .setValue("lifeline")
          .setDescription("Get more information about the Lifeline"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Crisis Text Line")
          .setValue("crisis_text")
          .setDescription("Get more information about the Crisis Text Line"),
        new StringSelectMenuOptionBuilder()
          .setLabel("International Resources")
          .setValue("international")
          .setDescription("Get more information about international resources")
      );

    const actionRow =
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await interaction.reply({
      embeds: [embed],
      components: [row, actionRow],
      ephemeral: true,
    });

    // Handle the select menu interaction
    const filter = (i: Interaction) => {
      return (
        i.isStringSelectMenu() &&
        i.customId === "crisis_resources" &&
        i.user.id === interaction.user.id
      );
    };
    const collector = (
      interaction.channel as TextChannel
    ).createMessageComponentCollector({ filter, time: 15000 });

    collector.on("collect", async (i) => {
      let responseEmbed = new EmbedBuilder()
        .setColor("Blue")
        .setFooter({ text: "You are not alone. Help is available." });

      if (i.isStringSelectMenu()) {
        switch (i.values[0]) {
          case "lifeline":
            responseEmbed
              .setTitle("National Suicide Prevention Lifeline")
              .setDescription("For immediate support, call 1-800-273-8255.");
            break;
          case "crisis_text":
            responseEmbed
              .setTitle("Crisis Text Line")
              .setDescription("Text HOME to 741741 for 24/7 support.");
            break;
          case "international":
            responseEmbed
              .setTitle("International Resources")
              .setDescription(
                "Visit [Find Help](https://www.iasp.info/resources/Crisis_Centres/) for resources in your area."
              );
            break;
        }
      }

      await i.update({ embeds: [responseEmbed], components: [] });
      collector.stop();
    });
  }
}
