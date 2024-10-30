import {
  EmbedBuilder,
  Events,
  Guild,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class GuildCreate extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.GuildCreate,
      description: "Guild join event",
      once: false,
    });
  }

  async Execute(guild: Guild) {
    try {
      if (!(await GuildConfig.exists({ guildId: guild.id })))
        await GuildConfig.create({ guildId: guild.id });
    } catch (error) {
      console.log(error);
    }

    const owner = await guild.fetchOwner();
    const betaEmbed = new EmbedBuilder()
      .setColor("#57F287") // A more vibrant shade of green
      .setTitle(`<:spaceship1:1299180094140715089> Beta Version Notice`)
      .setDescription(
        "Hey! I'm currently in BETA, which means you might encounter some bugs."
      )
      .addFields({
        name: "🐞 Found a Bug?",
        value: "If you find any issues, please report them to help us improve!",
      })
      .setFooter({ text: "Thank you for your support!" })
      .setTimestamp();

    owner?.send({ embeds: [betaEmbed] }).catch(console.error);

    // Send welcome message to the guild
    const welcomeEmbed = new EmbedBuilder()
      .setColor("#4287f5")
      .setTitle(`<:spaceship1:1299180094140715089> Hello, I'm Nova Bot!`)
      .setDescription(
        "Thank you for adding me to your server. I'm here to help!"
      )
      .addFields(
        {
          name: "🚀 Getting Started",
          value: "Use `/init` to set check the bot configurations.",
        },
        {
          name: "📚 Need Help?",
          value: "Type `/help command` for a list of available commands.",
        },
        {
          name: "⚠️ Beta Version",
          value:
            "Please note that I'm still in BETA, so you might encounter some bugs. Your feedback is appreciated!",
        }
      )
      .setFooter({
        text: "Nova Bot - Securing your server like if it was my own kid",
      });

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("Join Our Discord")
        .setURL("https://discord.gg/wqtMq67Q5A"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("Vote on Top.gg")
        .setURL("https://top.gg/bot/1293462897229303828")
    );

    const systemChannel = guild.systemChannel;
    if (systemChannel && systemChannel.isTextBased()) {
      (systemChannel as TextChannel)
        .send({ embeds: [welcomeEmbed], components: [actionRow] })
        .catch(console.error);
    } else {
      const firstTextChannel = guild.channels.cache.find(
        (channel) =>
          channel.isTextBased() &&
          channel.permissionsFor(guild.members.me!)?.has("SendMessages")
      ) as TextChannel | undefined;

      if (firstTextChannel) {
        firstTextChannel
          .send({ embeds: [welcomeEmbed], components: [actionRow] })
          .catch(console.error);
      }
    }
  }
}
