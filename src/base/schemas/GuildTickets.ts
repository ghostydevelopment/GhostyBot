import mongoose, { Schema, Document } from "mongoose";

interface IGuildTickets extends Document {
  guildId: string;
  enabled: boolean;
  category: string;
  supportRole: string;
  ticketCount: number;
  transcriptChannel: string;
  ticketChannel: string;
  welcomeMessage: string;
}

const GuildTicketsSchema: Schema = new Schema({
  guildId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  category: { type: String, default: "" },
  supportRole: { type: String, default: "" },
  ticketCount: { type: Number, default: 0 },
  transcriptChannel: { type: String, default: "" },
  ticketChannel: { type: String, default: "" },
  welcomeMessage: {
    type: String,
    default:
      "Welcome to your ticket! Please describe your issue and a staff member will be with you shortly.",
  },
});

const GuildTickets = mongoose.model<IGuildTickets>(
  "GuildTickets",
  GuildTicketsSchema
);

export default GuildTickets;
