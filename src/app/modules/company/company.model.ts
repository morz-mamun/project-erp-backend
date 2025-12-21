import mongoose, { Model, Schema } from "mongoose";
import { ICompany } from "./company.interface";
import { CompanyStatus } from "../../utils/enum/companyStatus";
import { SubscriptionPlan } from "../../utils/enum/subscriptionPlan";

/**
 * Company Schema
 * Represents a business/organization in the multi-tenant system
 */
const CompanySchema: Schema<ICompany> = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Please add a company name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add a company email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Please add a phone number"],
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    logo: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(CompanyStatus),
      default: CompanyStatus.PENDING,
    },
    subscription: {
      plan: {
        type: String,
        enum: Object.values(SubscriptionPlan),
        default: SubscriptionPlan.FREE,
      },
      startDate: Date,
      endDate: Date,
      features: [String],
    },
    settings: {
      currency: {
        type: String,
        default: "USD",
      },
      timezone: {
        type: String,
        default: "UTC",
      },
      taxRate: {
        type: Number,
        default: 0,
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "SuperAdmin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes (email index is automatically created by unique: true)
CompanySchema.index({ status: 1 });
CompanySchema.index({ createdAt: -1 });

// Model Export
const Company: Model<ICompany> = mongoose.model<ICompany>(
  "Company",
  CompanySchema,
);

export default Company;
