import mongoose, { Document, Types } from "mongoose";
import { UserRole } from "../../utils/enum/userRole";

/**
 * User role type (includes all roles)
 */
export type TRole = `${UserRole}`;

/**
 * JWT Payload interface
 */
export interface TJwtPayload {
  email: string;
  userId: Types.ObjectId;
  role: TRole;
  companyId?: Types.ObjectId; // Optional for SuperAdmin
}

/**
 * User interface (Company Admin, Manager, User)
 * Note: SuperAdmin has separate model
 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: TRole;
  companyId: Types.ObjectId; // Multi-tenant: Links user to company
  avatar?: string;
  isActive: boolean;
  isDeleted: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  matchPassword(enteredPassword: string): Promise<boolean>;
  updatePassword(newPassword: string): Promise<void>;
  toProfileJSON(): Partial<IUser>;
  isCompanyAdmin(): boolean;
}
