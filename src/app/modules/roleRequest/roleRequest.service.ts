import mongoose from "mongoose";
import { IRoleUpgradeRequest } from "./roleRequest.interface";
import RoleUpgradeRequest from "./roleRequest.model";
import User from "../auth/auth.user.model";
import { RoleRequestStatus } from "../../utils/enum/roleRequestStatus";
import { UserRole } from "../../utils/enum/userRole";
import AppError from "../../errors/functions/AppError";
import { httpStatusCode } from "../../utils/enum/statusCode";

/**
 * Create role upgrade request
 */
const createRoleRequest = async (
  userId: string,
  companyId: string,
  payload: { reason?: string },
): Promise<IRoleUpgradeRequest> => {
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatusCode.NOT_FOUND, "User not found");
  }

  // Check if user is already a manager
  if (user.role === UserRole.MANAGER || user.role === UserRole.COMPANY_ADMIN) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      "You already have manager or admin role",
    );
  }

  // Check if there's already a pending request
  const existingRequest = await RoleUpgradeRequest.findOne({
    userId,
    status: RoleRequestStatus.PENDING,
  });

  if (existingRequest) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      "You already have a pending request",
    );
  }

  // Create request
  const request = await RoleUpgradeRequest.create({
    userId,
    companyId,
    currentRole: user.role,
    requestedRole: UserRole.MANAGER,
    status: RoleRequestStatus.PENDING,
    reason: payload.reason,
  });

  return request;
};

/**
 * Get all role requests (Company Admin)
 */
const getAllRoleRequests = async (
  companyId: string,
  query: { status?: RoleRequestStatus; page?: number; limit?: number } = {},
): Promise<{ requests: IRoleUpgradeRequest[]; metadata: any }> => {
  const { status, page = 1, limit = 20 } = query;

  const filter: any = { companyId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const requests = await RoleUpgradeRequest.find(filter)
    .populate("userId", "name email phone")
    .populate("reviewedBy", "name email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await RoleUpgradeRequest.countDocuments(filter);

  return {
    requests,
    metadata: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get user's own role requests
 */
const getUserRoleRequests = async (
  userId: string,
): Promise<IRoleUpgradeRequest[]> => {
  const requests = await RoleUpgradeRequest.find({ userId })
    .populate("reviewedBy", "name email")
    .sort({ createdAt: -1 });

  return requests;
};

/**
 * Approve role request
 */
const approveRoleRequest = async (
  requestId: string,
  reviewerId: string,
  payload: { reviewNotes?: string },
): Promise<IRoleUpgradeRequest> => {
  const request = await RoleUpgradeRequest.findById(requestId);
  if (!request) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Request not found");
  }

  if (request.status !== RoleRequestStatus.PENDING) {
    throw new AppError(httpStatusCode.BAD_REQUEST, "Request is not pending");
  }

  // Update request
  request.status = RoleRequestStatus.APPROVED;
  request.reviewedBy = new mongoose.Types.ObjectId(reviewerId);
  request.reviewedAt = new Date();
  request.reviewNotes = payload.reviewNotes;
  await request.save();

  // Update user role
  await User.findByIdAndUpdate(request.userId, { role: UserRole.MANAGER });

  return request;
};

/**
 * Reject role request
 */
const rejectRoleRequest = async (
  requestId: string,
  reviewerId: string,
  payload: { reviewNotes?: string },
): Promise<IRoleUpgradeRequest> => {
  const request = await RoleUpgradeRequest.findById(requestId);
  if (!request) {
    throw new AppError(httpStatusCode.NOT_FOUND, "Request not found");
  }

  if (request.status !== RoleRequestStatus.PENDING) {
    throw new AppError(httpStatusCode.BAD_REQUEST, "Request is not pending");
  }

  // Update request
  request.status = RoleRequestStatus.REJECTED;
  request.reviewedBy = new mongoose.Types.ObjectId(reviewerId);
  request.reviewedAt = new Date();
  request.reviewNotes = payload.reviewNotes;
  await request.save();

  return request;
};

export const RoleRequestService = {
  createRoleRequest,
  getAllRoleRequests,
  getUserRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
};
