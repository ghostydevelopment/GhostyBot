import { ChatInputCommandInteraction } from "discord.js";
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

    interaction.reply({
      content: `Maintaince mode has been ${enabled ? "enabled" : "disabled"}.`,
      ephemeral: true,
    });
  }
}