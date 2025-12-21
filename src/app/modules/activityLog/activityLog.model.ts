import mongoose, { Model, Schema } from "mongoose";
import { IActivityLog } from "./activityLog.interface";

/**
 * Activity Log Schema
 * Audit trail for all system actions
 */
const ActivityLogSchema: Schema<IActivityLog> = new mongoose.Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      // null for Super Admin actions
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "User ID is required"],
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
    },
    resource: {
      type: String,
      required: [true, "Resource is required"],
      trim: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // Using custom timestamp field
  },
);

// Indexes
ActivityLogSchema.index({ companyId: 1, timestamp: -1 });
ActivityLogSchema.index({ userId: 1, timestamp: -1 });
ActivityLogSchema.index({ action: 1, timestamp: -1 });

// Model Export
const ActivityLog: Model<IActivityLog> = mongoose.model<IActivityLog>(
  "ActivityLog",
  ActivityLogSchema,
);

export default ActivityLog;
