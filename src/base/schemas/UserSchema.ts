import { Schema, model } from "mongoose";

interface IUser {
  userId: string;
  permissions: string[];
  botStaffAuthorized: boolean;
  tos: boolean; // Added tos field
}

const UserSchema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true },
  permissions: [{ type: String, required: true }],
  botStaffAuthorized: { type: Boolean, required: true },
  tos: { type: Boolean, required: true }, // Added tos field to schema
});

const User = model<IUser>("User", UserSchema);

export default User;
