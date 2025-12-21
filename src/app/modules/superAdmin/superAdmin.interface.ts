import { Document, Types } from "mongoose";

/**
 * SuperAdmin interface
 */
export interface ISuperAdmin extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "SUPER_ADMIN";
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  matchPassword(enteredPassword: string): Promise<boolean>;
  toProfileJSON(): Partial<ISuperAdmin>;
}
