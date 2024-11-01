import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
  } from "discord.js";
  import Command from "../../base/classes/Command";
  import CustomClient from "../../base/classes/CustomClient";
  import Category from "../../base/enums/Category";
  import ms from "ms";
  import os from "os";
  
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
        .setTitle("Crisis Help")
        .setDescription(`
          If you are in crisis, please use the following resources:
          > **National Suicide Prevention Lifeline:** 1-800-273-8255
          > **Crisis Text Line:** Text HOME to 741741
          > **Emergency Services:** 911
          > **International Resources:** [Find Help](https://www.iasp.info/resources/Crisis_Centres/)
        `)
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

      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });
    }
  }