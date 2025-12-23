import { Document, Types } from "mongoose";
import { SubscriptionPlan } from "../../utils/enum/subscriptionPlan";

export interface IPlanLimit {
  maxUsers: number;
  maxProducts: number;
  features: string[];
}

export interface IGlobalSettings extends Document {
  applicationName: string;
  maintenanceMode: boolean;
  allowCompanyRegistration: boolean;
  supportEmail: string;
  planLimits: {
    [key in SubscriptionPlan]: IPlanLimit;
  };
  createdAt: Date;
  updatedAt: Date;
}
