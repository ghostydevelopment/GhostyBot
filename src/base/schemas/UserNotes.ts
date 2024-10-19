import { model, Schema } from "mongoose";

interface IUserNote {
  _id: Schema.Types.ObjectId;
  noteId: string;
  content: string;
  moderatorId: string;
  createdAt: Date;
}

interface IUserNotes {
  userId: string;
  guildId: string;
  notes: IUserNote[];
}

const UserNoteSchema = new Schema<IUserNote>({
  _id: Schema.Types.ObjectId,
  noteId: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  moderatorId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model<IUserNotes>(
  "UserNotes",
  new Schema<IUserNotes>(
    {
      userId: { type: String, required: true },
      guildId: { type: String, required: true },
      notes: [UserNoteSchema],
    },
    {
      timestamps: true,
    }
  )
);
