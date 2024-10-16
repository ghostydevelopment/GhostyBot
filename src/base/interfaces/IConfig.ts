export default interface IConfig {
  token: string;
  discordClientID: string;
  mongoUrl: string;

  devToken: string;
  devDiscordClientID: string;
  devGuildId: string;
  devMongoUrl: string;
  developerUserIds: string[];
}
