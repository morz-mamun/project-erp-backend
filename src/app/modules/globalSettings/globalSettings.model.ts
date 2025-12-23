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
