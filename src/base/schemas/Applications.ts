import { Schema, model } from "mongoose";

interface IApplications {
  guildId: string;
  channelId: string; // Added channelId
  open: boolean;
  applications: string[];
}

const ApplicationsSchema = new Schema<IApplications>({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true }, // Added channelId
  open: { type: Boolean, required: true },
  applications: [{ type: String, required: true }],
});

const Applications = model<IApplications>("Applications", ApplicationsSchema);

export default Applications;
