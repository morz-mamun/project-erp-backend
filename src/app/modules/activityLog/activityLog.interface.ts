import { Document, Types } from "mongoose";

/**
 * Activity Log interface
 */
export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  companyId?: Types.ObjectId; // null for Super Admin actions
  userId: Types.ObjectId;
  action: string; // e.g., "CREATE_PRODUCT", "UPDATE_STOCK", "DELETE_USER"
  resource: string; // e.g., "Product", "Inventory", "User"
  resourceId?: Types.ObjectId;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
