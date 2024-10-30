import { Schema, model } from "mongoose";

interface IBackups {
  backupId: string;
  guildId: string;
  channels: string[];
  roles: string[];
  categories: string[];
}

const BackupsSchema = new Schema<IBackups>({
  backupId: { type: String, required: true },
  guildId: { type: String, required: true },
  channels: [{ type: String, required: true }],
  roles: [{ type: String, required: true }],
  categories: [{ type: String, required: true }],
});

const Backups = model<IBackups>("Backups", BackupsSchema);

export default Backups;
