import { Document, Types } from "mongoose";
import { SubscriptionPlan } from "../../utils/enum/subscriptionPlan";

export interface IPlanLimit {
  maxUsers: number;
  maxProducts: number;
  features: string[];
}

export interface ISystemFeatures {
  inventory: boolean;
  sales: boolean;
  crm: boolean;
  hrm: boolean;
  reports: boolean;
}

export interface IGlobalSettings extends Document {
  applicationName: string;
  maintenanceMode: boolean;
  allowCompanyRegistration: boolean;
  supportEmail: string;
  systemFeatures: ISystemFeatures;
  planLimits: {
    [key in SubscriptionPlan]: IPlanLimit;
  };
  createdAt: Date;
  updatedAt: Date;
}
