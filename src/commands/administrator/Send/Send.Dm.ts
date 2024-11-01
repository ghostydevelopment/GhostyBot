import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  User,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";

export default class SendDm extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "send.dm",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user") as User;
    const message = interaction.options.getString("message") || "No message provided";

    await interaction.deferReply({ ephemeral: true });

    try {
      if (!interaction.guild || !interaction.guild.members.cache.has(user.id)) {
        throw new Error("The specified user is not in this guild.");
      }

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("Direct Message")
        .setDescription(`${interaction.user} - "${message}"`)
        .setTimestamp();

      await user.send({ embeds: [embed] });

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(`✅ Successfully sent a DM to ${user}.`),
        ],
      });
    } catch (error) {
      console.error(error);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(`❌ There was an error while sending the DM. ${(error as Error).message}`),
        ],
      });
    }
  }
}