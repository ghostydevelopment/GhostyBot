import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } from "discord.js";
  import Command from "../../base/classes/Command";
  import CustomClient from "../../base/classes/CustomClient";
  import Category from "../../base/enums/Category";
  
  export default class InviteMe extends Command {
    constructor(client: CustomClient) {
      super(client, {
        name: "inviteme",
        description: "Get the bot invite link",
        category: Category.Utilities,
        default_member_permissions: PermissionFlagsBits.UseApplicationCommands,
        options: [],
        cooldown: 2,
        dev: false,
        dm_permission: true,
      });
    }
  
    async Execute(interaction: ChatInputCommandInteraction) {
      const clientId = this.client.developmentMode
        ? this.client.config.devDiscordClientID
        : this.client.config.discordClientID;
      const inviteLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot`;

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("Invite Me!")
        .setDescription(
          `Click [here](${inviteLink}) to invite the bot to your server!`
        )
        .setFooter({ text: "Thank you for choosing our bot!" })
        .setTimestamp();

      const button = new ButtonBuilder()
        .setLabel("Server")
        .setStyle(ButtonStyle.Link)
        .setURL("https://discord.gg/B8DxsRStmG");

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
  
      interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: false,
      });
    }
  }