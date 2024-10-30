import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalSubmitInteraction,
  Interaction,
  TextBasedChannel,
  Message,
  ButtonInteraction,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import GuildConfig from "../../../base/schemas/GuildConfig";

export default class BanAll extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "ban.all",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const silent = interaction.options.getBoolean("silent") || false;

    const errorEmbed = new EmbedBuilder().setColor("Red");

    try {
      const bans = await interaction.guild?.bans.fetch();
      if (!bans || bans.size === 0) {
        return interaction.reply({
          embeds: [
            errorEmbed.setDescription("❌ | There are no banned members in this guild."),
          ],
          ephemeral: true,
        });
      }

      const bannedMembers = bans.map(ban => `**${ban.user.tag}** (ID: ${ban.user.id}) - Reason: ${ban.reason || "No reason provided"}`).join("\n");

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("🔨 | Banned Members")
        .setDescription(bannedMembers)
        .setTimestamp()
        .setFooter({
          text: `Actioned by ${interaction.user.tag} - ${interaction.user.id}`,
          iconURL: interaction.user.displayAvatarURL({ size: 64 }),
        });

      const unbanButton = new ButtonBuilder()
        .setCustomId('unban_button')
        .setLabel('Unban')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(unbanButton);

      interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });

      if (!silent) {
        const channel = interaction.channel;
        if (channel && "send" in channel) {
          (channel as TextChannel).send({ embeds: [embed], components: [row] }).then(async (msg: Message) => await msg.react("🔨"));

          const guild = await GuildConfig.findOne({
            guildId: interaction.guildId,
          });

          if (
            guild &&
            guild.logs.moderation?.enabled &&
            guild.logs.moderation.channelId
          ) {
            const logChannel = (await interaction.guild?.channels.fetch(
              guild.logs.moderation.channelId
            )) as TextChannel;

            logChannel?.send({ embeds: [embed], components: [row] });
          }
        }
      }

      const filter = (i: Interaction) => i.isButton() && i.customId === 'unban_button' && i.user.id === interaction.user.id;
      const collector = (interaction.channel as TextChannel)?.createMessageComponentCollector({ filter, time: 60000 });

      collector?.on('collect', async (i: ButtonInteraction) => {
        if (i.customId === 'unban_button') {
          const modal = new ModalBuilder()
            .setCustomId('unban_modal')
            .setTitle('Unban User');

          const userIdInput = new TextInputBuilder()
            .setCustomId('user_id')
            .setLabel('User ID')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const modalRow = new ActionRowBuilder<TextInputBuilder>().addComponents(userIdInput);
          modal.addComponents(modalRow);

          await i.showModal(modal);
        }
      });

      interaction.client.on('interactionCreate', async (modalInteraction: Interaction) => {
        if (!modalInteraction.isModalSubmit()) return;
        if (modalInteraction.customId === 'unban_modal') {
          const userId = modalInteraction.fields.getTextInputValue('user_id');

          try {
            await interaction.guild?.bans.remove(userId);
            await modalInteraction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor("Green")
                  .setDescription(`🔨 | User with ID ${userId} has been unbanned.`),
              ],
              ephemeral: true,
            });
          } catch (error) {
            await modalInteraction.reply({
              embeds: [
                errorEmbed.setDescription(`❌ | Failed to unban user with ID ${userId}.`),
              ],
              ephemeral: true,
            });
          }
        }
      });
    } catch (error) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(`❌ | Failed to fetch banned members.`),
        ],
        ephemeral: true,
      });
    }
  }
}