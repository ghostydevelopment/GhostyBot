import mongoose, { Schema, Document } from "mongoose";

interface IWarn {
  warnId: string;
  userId: string;
  guildId: string;
  moderatorId: string;
  reason: string;
  timestamp: Date;
}

export interface IUserWarns extends Document {
  userId: string;
  guildId: string;
  warns: IWarn[];
}

const WarnSchema = new Schema<IWarn>({
  warnId: { type: String, required: true },
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  moderatorId: { type: String, required: true },
  reason: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const UserWarnsSchema = new Schema<IUserWarns>({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  warns: [WarnSchema],
});

UserWarnsSchema.index({ userId: 1, guildId: 1 }, { unique: true });

const UserWarns = mongoose.model<IUserWarns>("UserWarns", UserWarnsSchema);

export default UserWarns;
