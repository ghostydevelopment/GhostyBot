import {
  ChatInputCommandInteraction,
  ActivityType,
  PresenceStatusData,
} from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/Subcommand";
import Maintaince from "../../../base/schemas/Maintaince";

export default class MaintainceSet extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "maintaince.set",
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    const enabled = interaction.options.getBoolean("enabled", true);

    const maintaince = await Maintaince.findOne({});
    if (maintaince) {
      maintaince.enabled = enabled;
      await maintaince.save();
    } else {
      await Maintaince.create({ enabled });
    }

    if (enabled) {
      await this.client.user?.setPresence({
        activities: [
          {
            name: "Under Maintainance",
            type: ActivityType.Watching,
          },
        ],
        status: "dnd" as PresenceStatusData,
      });
    } else {
      const serverCount = this.client.guilds.cache.size;
      await this.client.user?.setPresence({
        activities: [
          {
            name: `Protecting ${serverCount} servers`,
            type: ActivityType.Custom,
          },
        ],
        status: "online" as PresenceStatusData,
      });
    }

    interaction.reply({
      content: `Maintaince mode has been ${enabled ? "enabled" : "disabled"}.`,
      ephemeral: true,
    });
  }
}
