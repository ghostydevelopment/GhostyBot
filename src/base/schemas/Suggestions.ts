import { Schema, model } from "mongoose";

interface ISuggestion {
  guildId: string;
  userId: string;
  content: string;
  suggestionId: string;
  channelId: string;
  timestamp: number;
}

const SuggestionSchema = new Schema<ISuggestion>({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  content: { type: String, required: false },
  suggestionId: { type: String, required: false },
  channelId: { type: String, required: true },
  timestamp: { type: Number, default: Date.now },
});

const Suggestions = model<ISuggestion>("Suggestions", SuggestionSchema);

export default Suggestions;
