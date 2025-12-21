import { Document, Types } from "mongoose";
import { RoleRequestStatus } from "../../utils/enum/roleRequestStatus";
import { UserRole } from "../../utils/enum/userRole";

/**
 * Role Upgrade Request interface
 */
export interface IRoleUpgradeRequest extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  companyId: Types.ObjectId;
  currentRole: UserRole;
  requestedRole: UserRole.MANAGER;
  status: RoleRequestStatus;
  reason?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
