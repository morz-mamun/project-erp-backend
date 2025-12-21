import mongoose, { Model, Schema } from "mongoose";
import { IRoleUpgradeRequest } from "./roleRequest.interface";
import { RoleRequestStatus } from "../../utils/enum/roleRequestStatus";
import { UserRole } from "../../utils/enum/userRole";

/**
 * Role Upgrade Request Schema
 * Allows users to request manager role upgrade
 */
const RoleUpgradeRequestSchema: Schema<IRoleUpgradeRequest> =
  new mongoose.Schema(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
      },
      companyId: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: [true, "Company ID is required"],
      },
      currentRole: {
        type: String,
        enum: Object.values(UserRole),
        required: [true, "Current role is required"],
      },
      requestedRole: {
        type: String,
        enum: [UserRole.MANAGER],
        required: [true, "Requested role is required"],
      },
      status: {
        type: String,
        enum: Object.values(RoleRequestStatus),
        default: RoleRequestStatus.PENDING,
      },
      reason: {
        type: String,
        trim: true,
      },
      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      reviewedAt: {
        type: Date,
      },
      reviewNotes: {
        type: String,
        trim: true,
      },
    },
    {
      timestamps: true,
    },
  );

// Indexes
RoleUpgradeRequestSchema.index({ companyId: 1, status: 1 });
RoleUpgradeRequestSchema.index({ userId: 1, status: 1 });
RoleUpgradeRequestSchema.index({ createdAt: -1 });

// Model Export
const RoleUpgradeRequest: Model<IRoleUpgradeRequest> =
  mongoose.model<IRoleUpgradeRequest>(
    "RoleUpgradeRequest",
    RoleUpgradeRequestSchema,
  );

export default RoleUpgradeRequest;
