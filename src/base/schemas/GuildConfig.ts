import { model, Schema } from "mongoose";

interface IGuildConfig {
  guildId: string;
  logs: {
    moderation: {
      enabled: boolean;
      channelId: string;
    };
  };
}

export default model<IGuildConfig>(
  "GuildConfig",
  new Schema<IGuildConfig>(
    {
      guildId: String,
      logs: {
        moderation: {
          enabled: Boolean,
          channelId: String,
        },
      },
    },
    {
      timestamps: true,
    }
  )
);
