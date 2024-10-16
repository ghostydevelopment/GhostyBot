import { ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient";

export default interface ISubcommand {
  client: CustomClient;
  name: string;

  Execute(interaction: ChatInputCommandInteraction): void;
}
