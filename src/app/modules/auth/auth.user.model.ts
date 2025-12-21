import bcrypt from "bcryptjs";
import mongoose, { Model, Schema } from "mongoose";

import { IUser } from "./auth.user.interface";
import { UserRole } from "../../utils/enum/userRole";
import AppError from "../../errors/functions/AppError";
import { httpStatusCode } from "../../utils/enum/statusCode";

/**
 * User Schema (Company Admin, Manager, User)
 * Multi-tenant: Each user belongs to a company
 */
const UserSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Please add a phone number"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: [UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.USER],
      required: [true, "Please specify a role"],
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "User must be associated with a company"],
    },
    avatar: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ companyId: 1, role: 1 });
UserSchema.index({ companyId: 1, createdAt: -1 });

// Pre-save middleware
UserSchema.pre("save", async function () {
  // * Unique email & phone check (only on create)
  if (this.isNew) {
    const existingUser = await User.findOne({
      $or: [{ email: this.email }, { phone: this.phone }],
    });

    if (existingUser) {
      // * Restore soft-deleted user
      if (existingUser.isDeleted) {
        existingUser.isDeleted = false;
        await existingUser.save();
      }

      if (existingUser.email === this.email) {
        throw new AppError(httpStatusCode.BAD_REQUEST, "Email already exists");
      }

      if (existingUser.phone === this.phone) {
        throw new AppError(
          httpStatusCode.BAD_REQUEST,
          "Phone number already exists",
        );
      }
    }
  }

  // * Hash password if modified
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Instance Methods

/**
 * Compare password
 */
UserSchema.methods.matchPassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * Update password
 */
UserSchema.methods.updatePassword = async function (
  newPassword: string,
): Promise<void> {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(newPassword, salt);
  await this.save();
};

/**
 * Public profile response
 */
UserSchema.methods.toProfileJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    companyId: this.companyId,
    avatar: this.avatar,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

/**
 * Check if user is Company Admin
 */
UserSchema.methods.isCompanyAdmin = function (): boolean {
  return this.role === UserRole.COMPANY_ADMIN;
};

// Model Export
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
