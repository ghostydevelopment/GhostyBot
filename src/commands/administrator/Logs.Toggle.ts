import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/Subcommand";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class LogsToggle extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "logs.toggle",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const logType = interaction.options.getString("log-type");
    const enabled = interaction.options.getBoolean("toggle");

    await interaction.deferReply({ ephemeral: true });

    try {
      let guild = await GuildConfig.findOne({ guildId: interaction.guildId });

      if (!guild)
        guild = await GuildConfig.create({ guildId: interaction.guildId });
      //@ts-ignore
      guild.logs[`${logType}`].enabled = enabled;

      await guild.save();

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription(
              `✅ Updated ${
                enabled ? "Enabled" : "Disabled"
              } \`${logType}\` logs`
            ),
        ],
      });
    } catch (error) {
      console.log(error);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              `❌ There was an error while updating the database. Please try again!`
            ),
        ],
      });
    }
  }
}
