import mongoose, { Model, Schema } from "mongoose";
import { IGlobalSettings } from "./globalSettings.interface";

const GlobalSettingsSchema: Schema<IGlobalSettings> = new mongoose.Schema(
  {
    applicationName: {
      type: String,
      default: "ERP System",
      trim: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowCompanyRegistration: {
      type: Boolean,
      default: true,
    },
    supportEmail: {
      type: String,
      default: "support@erp.com",
    },
    systemFeatures: {
      inventory: { type: Boolean, default: true },
      sales: { type: Boolean, default: true },
      crm: { type: Boolean, default: true },
      hrm: { type: Boolean, default: true },
      reports: { type: Boolean, default: true },
    },
    planLimits: {
      FREE: {
        maxUsers: { type: Number, default: 2 },
        maxProducts: { type: Number, default: 50 },
        features: { type: [String], default: [] },
      },
      BASIC: {
        maxUsers: { type: Number, default: 5 },
        maxProducts: { type: Number, default: 500 },
        features: { type: [String], default: [] },
      },
      PREMIUM: {
        maxUsers: { type: Number, default: 20 },
        maxProducts: { type: Number, default: 5000 },
        features: { type: [String], default: [] },
      },
      ENTERPRISE: {
        maxUsers: { type: Number, default: 9999 },
        maxProducts: { type: Number, default: 999999 },
        features: { type: [String], default: [] },
      },
    },
  },
  {
    timestamps: true,
  },
);

const GlobalSettings: Model<IGlobalSettings> = mongoose.model<IGlobalSettings>(
  "GlobalSettings",
  GlobalSettingsSchema,
);

export default GlobalSettings;
