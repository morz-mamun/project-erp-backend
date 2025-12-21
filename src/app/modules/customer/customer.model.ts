import mongoose, { Model, Schema } from "mongoose";
import { ICustomer } from "./customer.interface";

/**
 * Customer Schema
 */
const CustomerSchema: Schema<ICustomer> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },
    totalPurchases: {
      type: Number,
      default: 0,
      min: [0, "Total purchases cannot be negative"],
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: [0, "Total spent cannot be negative"],
    },
    lastPurchaseDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
CustomerSchema.index({ companyId: 1, phone: 1 });
CustomerSchema.index({ companyId: 1, email: 1 });

// Model Export
const Customer: Model<ICustomer> = mongoose.model<ICustomer>(
  "Customer",
  CustomerSchema,
);

export default Customer;
