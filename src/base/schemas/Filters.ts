import { Schema, model } from "mongoose";

interface IFilters {
  guildId: string;
  enable: boolean;
  words: boolean;
  links: boolean;
  nicknames: boolean; // Added nicknames
  raid: boolean; // Added raid
}

const FiltersSchema = new Schema<IFilters>({
  guildId: { type: String, required: true },
  enable: { type: Boolean, required: true },
  words: { type: Boolean, required: true },
  links: { type: Boolean, required: true },
  nicknames: { type: Boolean, required: true }, // Added nicknames
  raid: { type: Boolean, required: true }, // Added raid
});

const Filters = model<IFilters>("Filters", FiltersSchema);

export default Filters;
