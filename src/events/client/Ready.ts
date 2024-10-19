import { ActivityType, Collection, Events, REST, Routes } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";

export default class Ready extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.ClientReady,
      description: "Ready Event",
      once: true,
    });
  }

  async Execute() {
    console.log(`${this.client.user?.tag} is now online.`);

    // Set the bot's activity and status
    this.client.user?.setPresence({
      activities: [{ name: "over the server", type: ActivityType.Watching }],
      status: "dnd",
    });

    const clientId = this.client.developmentMode
      ? this.client.config.devDiscordClientID
      : this.client.config.discordClientID;
    const rest = new REST().setToken(this.client.config.token);

    if (!this.client.developmentMode) {
      const globalCommands: any = await rest.put(
        Routes.applicationCommands(clientId),
        {
          body: this.GetJson(
            this.client.commands.filter((command) => !command.dev)
          ),
        }
      );

      console.log(
        `Successfully loaded ${globalCommands.length} global commands.`
      );
    }

    const devCommands: any = await rest.put(
      Routes.applicationGuildCommands(clientId, this.client.config.devGuildId),
      {
        body: this.GetJson(
          this.client.commands.filter((command) => command.dev)
        ),
      }
    );

    console.log(
      `Successfully loaded ${devCommands.length} developer commands.`
    );
  }

  private GetJson(commands: Collection<string, Command>): object[] {
    const data: object[] = [];

    commands.forEach((command) => {
      const commandData: any = {
        name: command.name,
        description: command.description,
        options: command.options,
      };

      if (command.default_member_permissions !== undefined) {
        commandData.default_member_permissions =
          command.default_member_permissions.toString();
      }

      if (command.dm_permission !== undefined) {
        commandData.dm_permission = command.dm_permission;
      }

      data.push(commandData);
    });

    return data;
  }
}
