import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    User,
    TextChannel,
  } from "discord.js";
  import CustomClient from "../../../base/classes/CustomClient";
  import SubCommand from "../../../base/classes/Subcommand";
  
  export default class SaveMessage extends SubCommand {
    constructor(client: CustomClient) {
      super(client, {
        name: "save.message",
      });
    }
  
    async Execute(interaction: ChatInputCommandInteraction) {
      const user = interaction.options.getUser("user") as User;
      const logChannel = interaction.options.getChannel("channel") as TextChannel;
  
      await interaction.deferReply({ ephemeral: true });
  
      try {
        if (!interaction.guild || !interaction.guild.members.cache.has(user.id)) {
          throw new Error("The specified user is not in this guild.");
        }
  
        const channels = interaction.guild.channels.cache.filter(channel => channel.isTextBased());
        let userMessage = null;
  
        for (const channel of channels.values()) {
          const messages = await (channel as TextChannel).messages.fetch({ limit: 100 });
          userMessage = messages.find(msg => msg.author.id === user.id);
          if (userMessage) break;
        }
  
        if (!userMessage) {
          throw new Error("No recent message found for the specified user in the server.");
        }
  
        const embed = new EmbedBuilder()
          .setColor("Blue")
          .setTitle("Saved Message")
          .setDescription(`${userMessage.content}`)
          .setTimestamp(userMessage.createdTimestamp);
  
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setDescription(`✅ Successfully saved the most recent message from ${user}.`),
          ],
        });
  
        await logChannel.send({ embeds: [embed] });
      } catch (error) {
        console.error(error);
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription(`❌ There was an error while saving the message. ${(error as Error).message}`),
          ],
        });
      }
    }
  }