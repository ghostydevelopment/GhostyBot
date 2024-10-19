import { Schema, model } from "mongoose";

interface IAFK {
  userId: string;
  guildId: string;
  reason: string;
  timestamp: number;
}

const AFKSchema = new Schema<IAFK>({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  reason: { type: String, default: "AFK" },
  timestamp: { type: Number, default: Date.now },
});

const UserAFKS = model<IAFK>("UserAFKS", AFKSchema);

export default UserAFKS;
