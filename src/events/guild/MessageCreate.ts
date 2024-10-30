import { Events, Message, EmbedBuilder, TextChannel, ChannelType, PermissionsBitField } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Filters from "../../base/schemas/Filters"; // Use Filters schema
import GuildConfig from "../../base/schemas/GuildConfig"; // Import the GuildConfig schema for logging

export default class MessageCreate extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.MessageCreate,
      description:
        "Listens for messages and deletes those containing links or prohibited words if filtering is enabled.",
      once: false,
    });
  }

  async Execute(message: Message) {
    if (message.author.bot || !message.guild) return;

    // Retrieve filter settings for this guild
    const filterSettings = await Filters.findOne({
      guildId: message.guildId,
    });

    const linkRegex = /https?:\/\/\S+/gi;
    const badWords = [
      "fag",
      "faggot",
      "faggy",
      "tranny",
      "transfuck",
      "killyourself",
      "die",
      "kill yourself",
      "your faggot",
      "your a faggot",
      "nigger",
      "nigga",
      "your a nigger",
      "bitch",
      "your a bitch",
      "sex",
      "cp",
      "childporn",
      "child porn",
      "hitler",
      "nobody loves you",
      "your fatherless",
      "light yourself on fire",
      "die in a fire",
      "pussy",
      "pssy",
      "puss",
      "whore",
      "slut",
      "shut the fuck up",
      "rape",
      "r@pe",
      "bullshit",
      "porn",
      "pornhub",
      "x videos",
      "cunt",
      "nig nog",
      "pedobear",
      "penis",
      "dick",
      "dickhead",
      "asshole",
      "bastard",
      "bimbo",
      "boner",
      "boob",
      "bugger",
      "bum",
      "buttplug",
      "clitoris",
      "cock",
      "coon",
      "cooter",
      "cum",
      "cuntface",
      "cyberfuc",
      "dago",
      "damn",
      "deggo",
      "dildo",
      "doochbag",
      "douche",
      "dyke",
      "ejaculate",
      "erection",
      "fagbag",
      "fagtard",
      "feltch",
      "foreskin",
      "fuck",
      "fudgepacker",
      "gangbang",
      "gaylord",
      "gaytard",
      "goddamn",
      "gooch",
      "gook",
      "gringo",
      "handjob",
      "heeb",
      "hell",
      "honkey",
      "humping",
      "jackass",
      "jap",
      "jerk off",
      "jigaboo",
      "jizz",
      "jungle bunny",
      "kike",
      "kooch",
      "kootch",
      "kraut",
      "kyke",
      "lesbo",
      "lezzie",
      "mick",
      "minge",
      "muff",
      "muffdiver",
      "negro",
      "nipple",
      "nutsack",
      "paki",
      "pecker",
      "peckerhead",
      "penisfucker",
      "piss",
      "pissed",
      "pissed off",
      "polack",
      "poon",
      "prick",
      "punanny",
      "punta",
      "pussies",
      "pussylicking",
      "puto",
      "queef",
      "queer",
      "renob",
      "rimjob",
      "ruski",
      "schlong",
      "scrote",
      "shit",
      "shitdick",
      "skank",
      "skeet",
      "slutbag",
      "smeg",
      "snatch",
      "spic",
      "spick",
      "splooge",
      "spook",
      "suck",
      "tard",
      "testicle",
      "thundercunt",
      "tit",
      "tits",
      "twatlips",
      "twat",
      "twats",
      "vag",
      "vagina",
      "wank",
      "wetback",
      "whorebag",
      "wop",
      "wtf",
      "xxx",
      "yid",
      "zoophile",
    ];
    const wordRegex = new RegExp(badWords.join("|"), "gi");

    try {
      if (
        filterSettings &&
        filterSettings.links &&
        linkRegex.test(message.content)
      ) {
        await message.delete();
        await this.notifyUserAndLog(
          message,
          "🚫 Links are not allowed in this channel!"
        );
      } else if (
        filterSettings &&
        filterSettings.words &&
        wordRegex.test(message.content)
      ) {
        await message.delete();
        await this.notifyUserAndLog(
          message,
          "🚫 Prohibited language is not allowed in this channel!"
        );
      }
    } catch (error) {
      console.error("Failed to delete message or send notification:", error);
      if (message.channel instanceof TextChannel) {
        await message.channel.send("🚫 I don't have permission to delete messages.");
      }
    }
  }

  async notifyUserAndLog(message: Message, description: string) {
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setDescription(`${message.author}, ${description}`);

    if (message.channel instanceof TextChannel) {
      await message.channel.send({ embeds: [embed] });
    }

    // Log the deletion to the logs channel
    const guildConfig = await GuildConfig.findOne({
      guildId: message.guildId,
    });
    if (
      guildConfig?.logs.moderation?.enabled &&
      guildConfig.logs.moderation.channelId
    ) {
      const logChannel = (await message.guild?.channels.fetch(
        guildConfig.logs.moderation.channelId
      )) as TextChannel;
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor("Red")
          .setDescription(description)
          .addFields(
            { name: "User", value: `${message.author.tag}`, inline: true },
            {
              name: "Message Content",
              value: message.content.slice(0, 1024),
              inline: false,
            }
          )
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
      }
    }
  }

  async handleRaid(guild: any) {
    const channels = guild.channels.cache.filter((channel: any) => channel.type === ChannelType.GuildText);
    for (const [channelId, channel] of channels) {
      try {
        await channel.permissionOverwrites.edit(guild.roles.everyone, {
          SendMessages: false,
        });
      } catch (error) {
        console.error("Failed to lock channel:", error);
        await channel.send("🚫 I don't have permission to lock channels.");
      }
    }

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setDescription("🚨 Raid detected! All channels have been locked.");

    const guildConfig = await GuildConfig.findOne({
      guildId: guild.id,
    });
    if (
      guildConfig?.logs.moderation?.enabled &&
      guildConfig.logs.moderation.channelId
    ) {
      const logChannel = (await guild.channels.fetch(
        guildConfig.logs.moderation.channelId
      )) as TextChannel;
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    }
  }
}
