import bcrypt from "bcryptjs";
import mongoose, { Model, Schema } from "mongoose";
import { ISuperAdmin } from "./superAdmin.interface";

/**
 * SuperAdmin Schema
 * System owner with full access to all companies
 */
const SuperAdminSchema: Schema<ISuperAdmin> = new mongoose.Schema(
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
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      default: "SUPER_ADMIN",
      immutable: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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
SuperAdminSchema.index({ email: 1 });

// Pre-save middleware: Hash password if modified
SuperAdminSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Instance Methods

/**
 * Compare entered password with hashed password
 */
SuperAdminSchema.methods.matchPassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * Return public profile data (exclude password)
 */
SuperAdminSchema.methods.toProfileJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Model Export
const SuperAdmin: Model<ISuperAdmin> = mongoose.model<ISuperAdmin>(
  "SuperAdmin",
  SuperAdminSchema,
);

export default SuperAdmin;
