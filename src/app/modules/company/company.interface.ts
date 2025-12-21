import mongoose, { Document, Types } from "mongoose";
import { CompanyStatus } from "../../utils/enum/companyStatus";
import { SubscriptionPlan } from "../../utils/enum/subscriptionPlan";

/**
 * Address interface
 */
export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

/**
 * Subscription interface
 */
export interface ISubscription {
  plan: SubscriptionPlan;
  startDate?: Date;
  endDate?: Date;
  features: string[];
}

/**
 * Company settings interface
 */
export interface ICompanySettings {
  currency: string;
  timezone: string;
  taxRate: number;
}

/**
 * Company interface
 */
export interface ICompany extends Document {
  _id: Types.ObjectId;
  companyName: string;
  email: string;
  phone: string;
  address?: IAddress;
  logo?: string;
  status: CompanyStatus;
  subscription: ISubscription;
  settings: ICompanySettings;
  createdBy?: Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
