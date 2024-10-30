import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMemberRoleManager,
  Role,
  TextChannel,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";

export default class ServerRole extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "server.role",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const roleType = interaction.options.getString("type") || "Dividers";
    const errorEmbed = new EmbedBuilder().setColor("Red");

    if (
      ![
        "Dividers",
        "Level",
        "Dms",
        "Sexuality",
        "Region",
        "Nationality",
      ].includes(roleType)
    ) {
      return interaction.reply({
        embeds: [errorEmbed.setDescription(`❌ | Invalid role type`)],
        ephemeral: true,
      });
    }

    try {
      switch (roleType) {
        case "Dividers":
          const dividerNames = [
            "Section A",
            "Section B",
            "Section C",
            "Section D",
            "Section E",
          ];
          dividerNames.forEach(async (name, index) => {
            await interaction.guild?.roles.create({
              name,
              color: 0x0099ff,
              position: index + 1,
            });
          });
          break;
        case "Level":
          const levelNames = Array.from(
            { length: 10 },
            (_, i) => `Level ${10 * (i + 1)}`
          );
          levelNames.forEach(async (name, index) => {
            await interaction.guild?.roles.create({
              name,
              color: 0x00ff00,
              position: 10 * (index + 1),
            });
          });
          break;
        case "Dms":
          const dmNames = ["Dms Open", "Dms Ask", "Dms Close", "Dms Off"];
          dmNames.forEach(async (name, index) => {
            await interaction.guild?.roles.create({
              name,
              color: 0xff0000,
              position: index + 1,
            });
          });
          break;
        case "Sexuality":
          const sexualities = [
            "Straight",
            "Gay",
            "Bisexual",
            "Asexual",
            "Pansexual",
          ];
          sexualities.forEach(async (name, index) => {
            await interaction.guild?.roles.create({
              name,
              color: 0x00ffff,
              position: index,
            });
          });
          break;
        case "Region":
          const regions = [
            "Americas",
            "Europe",
            "Asia-Pacific",
            "Middle East",
            "Africa",
          ];
          regions.forEach(async (name, index) => {
            await interaction.guild?.roles.create({
              name,
              color: 0xffff00,
              position: index,
            });
          });
          break;
        case "Nationality":
          const nationalities = ["USA", "UK", "China", "India", "Russia"];
          nationalities.forEach(async (name, index) => {
            await interaction.guild?.roles.create({
              name,
              color: 0x008080,
              position: index,
            });
          });
          break;
      }

      // Send a message in the server indicating the roles have been created
      const successEmbed = new EmbedBuilder()
        .setColor("Green")
        .setDescription(`Roles created successfully for ${roleType}!`);
      if (interaction.channel && "send" in interaction.channel) {
        await interaction.channel.send({ embeds: [successEmbed] });
      }

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`Roles created successfully for ${roleType}!`),
        ],
        ephemeral: true,
      });
    } catch {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `❌ | An error has occurred, please contact Matty.`
          ),
        ],
        ephemeral: true,
      });
    }
  }
}
