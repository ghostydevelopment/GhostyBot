import { ChatInputCommandInteraction } from "discord.js";
import ISubcommand from "../interfaces/ISubcommand";
import CustomClient from "./CustomClient";
import ISubcommandOptions from "../interfaces/ISubcommandOptions";

export default class SubCommand implements ISubcommand {
  client: CustomClient;
  name: string;

  constructor(client: CustomClient, options: ISubcommandOptions) {
    this.client = client;
    this.name = options.name;
  }
  Execute(interaction: ChatInputCommandInteraction): void {}
}
