import { Document, Types } from "mongoose";

export interface IGlobalSettings extends Document {
  applicationName: string;
  maintenanceMode: boolean;
  allowCompanyRegistration: boolean;
  supportEmail: string;
  createdAt: Date;
  updatedAt: Date;
}
