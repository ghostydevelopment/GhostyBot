import mongoose, { Schema, Document } from "mongoose";

interface IMaintaince extends Document {
  enabled: boolean;
  developerId: string;
}

const MaintainceSchema: Schema = new Schema({
  enabled: { type: Boolean, required: true },
  developerId: { type: String, required: true },
});

const Maintaince = mongoose.model<IMaintaince>(
  "Maintaince",
  MaintainceSchema
);

export default Maintaince;
