import mongoose, { Document, Types } from "mongoose";

/**
 * Address interface
 */
export interface ICustomerAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

/**
 * Customer interface
 */
export interface ICustomer extends Document {
  _id: Types.ObjectId;
  name: string;
  email?: string;
  phone: string;
  address?: ICustomerAddress;
  companyId: Types.ObjectId;
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
