import { Schema, model } from "mongoose";

interface IUser {
  userId: string;
  permissions: string[];
  botStaffAuthorized: boolean;
}

const UserSchema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true },
  permissions: [{ type: String, required: true }],
  botStaffAuthorized: { type: Boolean, required: true },
});

const User = model<IUser>("User", UserSchema);

export default User;
